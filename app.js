const client = contentful.createClient({
  // Contentfull configuration
  // This is the space ID. A space is like a project folder in Contentful terms
  space: '5iedh4ksjfvc',
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: '60jxZAVwES5BuqZpRkpBd5Sb2u7l336J0FIkKCD67V8',
})
// This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.
// client
//   .getEntry('5PeGS2SoZGSa4GuiQsigQu')
//   .then((entry) => console.log(entry))
//   .catch((err) => console.log(err))
console.log(client)

// variables

const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDom = document.querySelector('.products-center')

// cart item in general
let cart = []
// buttons
let buttonsDOM = []

//getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: 'comfortHome',
      })
      console.log(contentful)
      // let result = await fetch('products.json')
      // let data = await result.json()
      // let products = data.items

      let products = contentful.items

      products = products.map((item) => {
        const { title, price } = item.fields
        const { id } = item.sys
        const image = item.fields.image.fields.file.url
        return { title, price, id, image }
      })
      return products
    } catch (error) {
      console.log(error)
    }
  }
}

//displaying products

class UI {
  displayProducts(products) {
    let result = ''
    products.forEach((product) => {
      result += `<article class="product">
          <div class="img-container">
            <img
              src="${product.image}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>`
    })
    productsDom.innerHTML = result
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')]
    buttonsDOM = buttons
    // console.log(buttons)
    buttons.forEach((button) => {
      let id = button.dataset.id
      let inCart = cart.find((item) => item.id === id)
      if (inCart) {
        button.innerText = 'In Cart'
        button.disabled = true
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart'
        event.target.disabled = true
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 }
        // console.log(cartItem)
        // add product to the cart
        cart = [...cart, cartItem]
        // save cart in local storage
        Storage.saveCart(cart)
        // set cart value
        this.setcartValue(cart)
        // display cart item
        this.addCartItem(cartItem)
        // show the cart
        this.showCart()
      })
    })
  }
  setcartValue(cart) {
    let tempTotal = 0
    let itemsTotal = 0
    cart.map((item) => {
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal
  }
  addCartItem(item) {
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = ` <img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>${item.price}</h5>
              <span class="remove-item" data-id = ${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id = ${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down"data-id = ${item.id}></i>
            </div>`
    cartContent.appendChild(div)
    // console.log(cartContent)
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
  }
  setUpApp() {
    cart = Storage.getCart()
    this.setcartValue(cart)
    this.populateCart(cart)
    cartBtn.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item)
    })
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
  }
  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })
    // cart functionality
    cartContent.addEventListener('click', (event) => {
      console.log(event.target)
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        console.log(removeItem)
        let id = removeItem.dataset.id
        console.log(id)
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id)
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target
        console.log(addAmount)
        let id = addAmount.dataset.id
        console.log(id)
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount + 1
        Storage.saveCart(cart)
        this.setcartValue(cart)
        addAmount.nextElementSibling.innerText = tempItem.amount
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target
        console.log(lowerAmount)
        let id = lowerAmount.dataset.id
        console.log(id)
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount - 1
        if (tempItem.amount > 0) {
          Storage.saveCart(cart)
          this.setcartValue(cart)
          lowerAmount.previousElementSibling.innerText = tempItem.amount
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id)
    cartItems.forEach((id) => this.removeItem(id))
    console.log(cartContent.children)
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id)
    this.setcartValue(cart)
    Storage.saveCart(cart)
    let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id)
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products))
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'))
    return products.find((product) => product.id === id)
  }
  static saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : []
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI()
  const products = new Products()

  //setup app
  ui.setUpApp()
  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products)
      Storage.saveProducts(products)
    })
    .then(() => {
      ui.getBagButtons()
      ui.cartLogic()
    })
})
