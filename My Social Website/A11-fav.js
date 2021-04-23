const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const dataPanel = document.querySelector('.dataPanel')
const searchForm = document.querySelector('#searchForm')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

let page = 1  //儲存用戶位於第幾頁
let filteredUser = []
const userPerPage = 30
const favoriteUser = JSON.parse(localStorage.getItem('favoriteUser'))

dataPanel.addEventListener('click', function onClickPanel(event) {
  if (event.target.matches('.userAvatar')) {
    showUserModal(event.target.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.id))
    renderPaginator(filteredUser)
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUser = favoriteUser.filter(user =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )

  if (filteredUser.length === 0) {
    return alert('Cannot find user with keyword: ' + keyword)
  }

  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUser)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  page = Number(event.target.innerText)
  if (event.target.tagName !== 'A') return
  renderUserList(getUsersByPage(page))
})

function renderPaginator(data) {
  const numberOfPages = Math.ceil(data.length / userPerPage)
  let rawHTML = ''

  for (let i = 1; i <= numberOfPages; i++) {
    rawHTML += `
    <li class="page-item">
      <a class="page-link" href="#">${i}</a>
    </li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  // 輸出users的第page頁資料
  let data = []
  filteredUser.length === 0
    ? data = favoriteUser.slice(userPerPage * page - 30, userPerPage * page)
    : data = filteredUser.slice(userPerPage * page - 30, userPerPage * page)
  return data
}

function removeFromFavorite(id) {
  let index = favoriteUser.findIndex(element => element.id === id)
  favoriteUser.splice(index, 1)
  index = filteredUser.findIndex(element => element.id === id)
  filteredUser.splice(index, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(favoriteUser))
  renderUserList(getUsersByPage(page))
}

function showUserModal(id) {
  axios.get(INDEX_URL + id).then(response => {
    const modalName = document.querySelector('.user-data-name')
    const modalSurname = document.querySelector('.user-data-surname')
    const modalEmail = document.querySelector('.user-data-email')
    const modalGender = document.querySelector('.user-data-gender')
    const modalAge = document.querySelector('.user-data-age')
    const modalRegion = document.querySelector('.user-data-region')
    const modalBirthday = document.querySelector('.user-data-birthday')

    modalName.innerText = 'Name : ' + response.data.name
    modalSurname.innerText = 'Surname : ' + response.data.surname
    modalEmail.innerText = 'Email : ' + response.data.email
    modalGender.innerText = 'Gender : ' + response.data.gender
    modalAge.innerText = 'Age : ' + response.data.age
    modalRegion.innerText = 'Region : ' + response.data.region
    modalBirthday.innerText = 'Birthday : ' + response.data.birthday
  }).catch(error => {
    console.log(error)
  })
}

function renderUserList(users) {
  let rawHTML = ''
  users.forEach(item => {
    rawHTML += `
      <div class="card m-2 p-0" style="width: 12rem;">
        <img src="${item.avatar}" class="card-img-top userAvatar" alt="avatar" data-bs-toggle="modal" data-bs-target="#userModal" id="${item.id}">
        <div class="card-body">
          <p class="card-text" style="text-align: center">${item.name + ' ' + item.surname}</p>
        </div>
        <div class="card-footer d-flex justify-content-center">
          <button class="btn btn-info btn-remove-favorite" id="${item.id}">移除摯友名單</button>
        </div>
      </div>`
  });
  dataPanel.innerHTML = rawHTML
}

renderUserList(getUsersByPage(1))
renderPaginator(favoriteUser)
filteredUser = favoriteUser
console.log(favoriteUser)
console.log(filteredUser)