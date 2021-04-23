const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const dataPanel = document.querySelector('.dataPanel')
const searchForm = document.querySelector('#searchForm')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const userPerPage = 30
const users = []
let filteredUser = []

axios.get(INDEX_URL).then(response => {
  users.push(...response.data.results)
  renderPaginator(users)
  renderUserList(getUsersByPage(1))
}).catch(error => {
  console.log(error)
})

dataPanel.addEventListener('click', function onClickPanel(event) {
  if (event.target.matches('.userAvatar')) {
    showUserModal(event.target.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUser = users.filter(user => 
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )

  if (filteredUser.length === 0) {
    return alert('Cannot find user with keyword: ' + keyword)
  }

  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUser)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  const page = event.target.innerText
  filteredUser.length === 0
    ? renderUserList(getUsersByPage(page))
    : renderUserList(getUsersByPage(page))
})

function renderPaginator(data) {
  const numberOfPages = Math.ceil(data.length / userPerPage)
  let rawHTML = ''

  for(let i = 1; i <= numberOfPages; i++) {
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
    ? data = users.slice(userPerPage * page - 30, userPerPage * page)
    : data = filteredUser.slice(userPerPage * page - 30, userPerPage * page)
  return data
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
  let user = users.find((element) => element.id === id)

  if (list.some(element => element.id === id)) {
    return alert('該用戶已經在摯友名單中！')
  } 
  
  list.push(user)

  localStorage.setItem('favoriteUser', JSON.stringify(list))
}

function showUserModal(id) {
  axios.get(INDEX_URL + id).then(response =>{
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
      <div class="card-body d-flex justify-content-center">
        <p class="card-text" style="text-align: center; font-weight: 1000;">${item.name + ' ' + item.surname}</p>
      </div>
      <div class="card-footer d-flex justify-content-center">
        <button class="btn btn-info btn-add-favorite" id="${item.id}">摯友</button>
      </div>
    </div>`
  });
  dataPanel.innerHTML = rawHTML
}



