import axios from 'axios';

// 발급받으신 TTBKey입니다.
const TTB_KEY = 'ttbexitme2156001';

/**
 * 도서 검색 함수
 * @param {string} query - 검색어 (제목, 저자 등)
 */
async function searchAladinBooks(query) {
  try {
    const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
      params: {
        ttbkey: TTB_KEY,
        Query: query,          // 검색어
        QueryType: 'Title',    // 제목 검색
        MaxResults: 5,         // 검색 결과 개수
        start: 1,              // 시작 페이지
        SearchTarget: 'Book',  // 도서 대상
        output: 'js',          // JSON 형식으로 받기 (js 또는 xml)
        Version: '20131101'    // 최신 API 버전
      }
    });

    const books = response.data.item;

    if (books && books.length > 0) {
      console.log(`'${query}' 검색 결과:`);
      books.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title} - ${book.author} (ISBN: ${book.isbn})`);
      });
    } else {
      console.log('검색 결과가 없습니다.');
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error.message);
  }
}

// 테스트 실행 (원하시는 도서명을 넣어보세요)
searchAladinBooks('니체');
