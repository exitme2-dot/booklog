import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { Octokit } from '@octokit/rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// === [설정 단계 1] GitHub 연동 정보 설정 ===
// GitHub에서 발급받은 토큰을 환경 변수에서 가져옵니다.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// 해당 저장소의 소유자(ID)와 저장소 이름을 설정합니다. (환경 변수 또는 기본값)
const OWNER = process.env.GITHUB_OWNER || 'exitme2-dot';
const REPO = process.env.GITHUB_REPO || 'booklog';
const BOOKS_FILE_PATH = 'books.json';
const LIBRARY_MD_PATH = 'my_library.md';

const LOCAL_BOOKS_FILE = path.join(__dirname, 'books.json');

// GitHub API를 사용하기 위한 도구(Octokit)를 초기화합니다.
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// 메모리 내에 도서 목록을 임시 저장할 변수입니다.
let booksCache = [];
// GitHub 토큰이 설정되어 있는지 확인하여 클라우드 저장 모드를 결정합니다.
let isGithubEnabled = !!GITHUB_TOKEN && !!process.env.GITHUB_OWNER && !!process.env.GITHUB_REPO;

app.use(compression());
app.use(express.json());

/**
 * === [기능 1] GitHub에서 파일 내용 가져오기 ===
 * GitHub 저장소에 있는 파일의 현재 내용과 SHA(버전 체크용 아이디)를 가져옵니다.
 */
async function getGithubFile(filePath) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: filePath,
    });
    // GitHub은 파일 내용을 Base64 문자열로 보내주므로, 이를 다시 텍스트로 변환합니다.
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
  } catch (error) {
    // 파일이 아직 없는 경우 null을 반환합니다.
    return null;
  }
}

/**
 * === [기능 2] GitHub 파일 업데이트하기 (추가/수정) ===
 * 새로운 내용을 GitHub 저장소의 파일에 저장(커밋)합니다.
 */
async function updateGithubFile(filePath, content, message, sha = null) {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      message: message,
      content: Buffer.from(content).toString('base64'), // 내용을 Base64로 인코딩하여 전송
      sha: sha, // 기존 파일이 있는 경우 SHA 값이 필수로 필요합니다.
    });
  } catch (error) {
    console.error(`GitHub 파일 업데이트 실패 (${filePath}):`, error.message);
  }
}

/**
 * === [기능 3] 도서 데이터 초기 로드 ===
 * 서버가 켜질 때 GitHub(또는 로컬 파일)에서 데이터를 읽어와서 메모리에 담습니다.
 */
async function loadBooks() {
  if (isGithubEnabled) {
    console.log('GitHub API를 통해 데이터를 불러오는 중...');
    const file = await getGithubFile(BOOKS_FILE_PATH);
    if (file) {
      booksCache = JSON.parse(file.content);
      console.log(`GitHub에서 ${booksCache.length}개의 도서를 불러왔습니다.`);
    } else {
      console.log('GitHub에 데이터 파일이 없습니다. 새로 시작합니다.');
      booksCache = [];
    }
  } else {
    // 로컬 개발 환경일 때 실행됨
    try {
      await fs.access(LOCAL_BOOKS_FILE);
      const data = await fs.readFile(LOCAL_BOOKS_FILE, 'utf-8');
      booksCache = JSON.parse(data);
      console.log('로컬 파일에서 데이터를 불러왔습니다.');
    } catch {
      booksCache = [];
    }
  }
}

/**
 * === [기능 4] 도서 목록 저장 (전체 동기화) ===
 * 전체 도서 목록(JSON)을 GitHub이나 로컬에 저장합니다.
 */
async function syncStorage() {
  if (isGithubEnabled) {
    const file = await getGithubFile(BOOKS_FILE_PATH);
    await updateGithubFile(
      BOOKS_FILE_PATH,
      JSON.stringify(booksCache, null, 2),
      'Update books.json',
      file?.sha
    );
  } else {
    // 로컬 파일 저장
    const tempFile = `${LOCAL_BOOKS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(booksCache, null, 2), 'utf-8');
    await fs.rename(tempFile, LOCAL_BOOKS_FILE);
  }
}

/**
 * === [기능 5] 마크다운 파일에 도서 정보 추가 (Append) ===
 * GitHub의 my_library.md 파일 끝에 새로운 내용을 덧붙입니다.
 */
async function appendToMarkdownGithub(book) {
  if (!isGithubEnabled) return;

  // 1. 기존 파일 내용을 가져옵니다.
  const file = await getGithubFile(LIBRARY_MD_PATH);
  const oldContent = file ? file.content : '# My Library\n';
  
  // 2. 추가할 마크다운 문구를 생성합니다.
  const date = new Date().toLocaleDateString('ko-KR');
  const newEntry = `\n### ${book.title}\n- 저자: ${book.author}\n- 평점: ${'⭐'.repeat(book.rating || 0)}\n- 기록일: ${date}\n> ${book.review || '한줄평이 없습니다.'}\n\n---\n`;
  
  // 3. 기존 내용 하단에 새 내용을 합쳐서 저장합니다.
  await updateGithubFile(
    LIBRARY_MD_PATH,
    oldContent + newEntry,
    `Add book: ${book.title}`,
    file?.sha
  );
  console.log(`GitHub 'my_library.md'에 '${book.title}' 정보가 기록되었습니다.`);
}

/**
 * === [기능 6] GitHub 설정 검증 ===
 * 서버 시작 시 GitHub 토큰과 저장소 설정이 유효한지 확인합니다.
 */
async function validateGithubSetup() {
  if (!GITHUB_TOKEN) {
    console.log('[STORAGE] GitHub 토큰이 설정되지 않았습니다. 로컬 파일 모드로 실행합니다.');
    isGithubEnabled = false;
    return;
  }

  if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    console.warn('[STORAGE] GITHUB_OWNER 또는 GITHUB_REPO가 설정되지 않았습니다. 안전을 위해 로컬 모드로 전환합니다.');
    isGithubEnabled = false;
    return;
  }

  try {
    // 가장 가벼운 API 호출로 토큰 및 권한 확인
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`[GITHUB] 토큰 인증 성공: ${user.login} (ID: ${user.id})`);
    
    // 저장소 접근 권한 확인
    await octokit.repos.get({ owner: OWNER, repo: REPO });
    console.log(`[GITHUB] 저장소 연결 성공: ${OWNER}/${REPO}`);
    isGithubEnabled = true;
  } catch (error) {
    console.error('[GITHUB] 연동 실패:', error.message);
    if (error.status === 401) {
      console.error('  -> 이유: 잘못된 토큰이거나 토큰이 만료되었습니다.');
    } else if (error.status === 404) {
      console.error('  -> 이유: 저장소를 찾을 수 없거나 접근 권한이 없습니다.');
    }
    console.log('[STORAGE] GitHub 연동 오류로 인해 로컬 파일 모드로 실행합니다.');
    isGithubEnabled = false;
  }
}

// 서버 시작 시 데이터 로드 및 검증 실행
async function startServer() {
  await validateGithubSetup();
  await loadBooks();
}

startServer();

// --- API 엔드포인트 설정 ---

// 전체 도서 목록 가져오기
app.get('/api/books', (req, res) => {
  res.json(booksCache);
});

// 도서 추가 (핵심 기능)
app.post('/api/books/add', async (req, res) => {
  try {
    const newBook = req.body;
    // 1. 메모리 업데이트
    booksCache = [newBook, ...booksCache];
    
    // 2. 클라우드/로컬 저장소 동기화
    await syncStorage();
    
    // 3. GitHub 마크다운 파일에 기록 추가 (GitHub 토큰이 있을 때만 실행)
    if (isGithubEnabled) {
      await appendToMarkdownGithub(newBook);
    }
    
    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('도서 추가 중 오류:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// 도서 삭제
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  booksCache = booksCache.filter(b => b.id !== id);
  await syncStorage();
  res.json({ message: 'Book deleted' });
});

// 서버 실행
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`GitHub 저장소 모드: ${isGithubEnabled ? '활성화' : '비활성화 (로컬 파일 사용)'}`);
  });
}

export default app;
