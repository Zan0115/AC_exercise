const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

let mode = 'card' //預設是card模式
let page = 1

const datapanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const btnCard = document.querySelector('#btn-card')
const btnlist = document.querySelector('#btn-list')

datapanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  page = event.target.innerText

  if (event.target.tagName !== 'A') return

  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //請瀏覽器終止元件的預設行為，把控制權交給 JavaScript
  const keyword = searchInput.value.trim().toLowerCase() //.trim() 把字串前面跟後面的空白去掉

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

btnCard.addEventListener('click', function onBtnCardClicked(event) {
  // 切換至card模式
  mode = 'card'
  renderMovieList(getMoviesByPage(page))
})

btnlist.addEventListener('click', function onBtnListClicked(event) {
  // 切換至list模式
  mode = 'list'
  renderMovieList(getMoviesByPage(page))
})

function getMoviesByPage(page) {
  // page 1 -> movies 0-11
  // page 2 -> movies 12-23
  // page 3 -> movies 24-35

  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //把json字串轉成js資料
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))  //把資料轉成json字串
}

function renderMovieList(data) {
  let rawHTML = ''
  if (mode === "card") {
    data.forEach(item => {
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"alt="Movie post">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
  } else if (mode === "list") {
    rawHTML += '<ul class="list-group list-group-flush">'
    data.forEach(item => {
      rawHTML += `
          <li class="list-group-item d-flex flex-row">
            <div class="movie-title-list me-auto">${item.title}</div>
            <div class="movie-btn-group-list">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </li>`
    })
    rawHTML += '</ul>'
  }

  datapanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

axios.get(INDEX_URL).then(response => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})

