let cartService;

class ShoppingCartService {
  cart = {
    items: [],
    total: 0,
  };

  addToCart(productId) {
    const url = `${config.baseUrl}/cart/products/${productId}`;
    // const headers = userService.getHeaders();

    axios
      .post(url, {}) // ,{headers})
      .then((response) => {
        // if(response.status === 200 || response.status === 201) {
        //     this.setCart(response.data);
        //     this.updateCartDisplay()
        // }else{
        //     console.error("unexpected status code: " + response.status)
        //     throw new Error("unexpected response");
        // }
        this.setCart(response.data);

        this.updateCartDisplay();
        this.loadCart();
      })
      .catch((error) => {
        const data = {
          error: "Add to cart failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }

  setCart(data) {
    this.cart = {
      items: [],
      total: 0,
    };

    this.cart.total = data.total;

    for (const [key, value] of Object.entries(data.items)) {
      this.cart.items.push(value);
    }
  }

  loadCart() {
    const url = `${config.baseUrl}/cart`;

    axios
      .get(url)
      .then((response) => {
        this.setCart(response.data);

        this.updateCartDisplay();
      })
      .catch((error) => {
        const data = {
          error: "Load cart failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }

  async loadCartPage() {
    // templateBuilder.build("cart", this.cart, "main");

    const main = document.getElementById("main");
    main.innerHTML = "";

    let div = document.createElement("div");
    div.classList = "filter-box";
    main.appendChild(div);

    const contentDiv = document.createElement("div");
    contentDiv.id = "content";
    contentDiv.classList.add("content-form");

    const cartHeader = document.createElement("div");
    cartHeader.classList.add("cart-header");

    const h1 = document.createElement("h1");
    h1.innerText = "Cart";
    cartHeader.appendChild(h1);

    const buttonContainer = document.createElement("div");

    const clearButton = document.createElement("button");
    clearButton.classList.add("btn", "btn-danger");
    clearButton.innerText = "Clear";
    clearButton.style.marginRight = "10px"; // Add space between buttons

    clearButton.addEventListener("click", () => this.clearCart());
    buttonContainer.appendChild(clearButton);

    const checkoutButton = document.createElement("button");
    checkoutButton.classList.add("btn", "btn-primary");
    checkoutButton.innerText = "Checkout";
    checkoutButton.addEventListener("click", () => this.checkout());
    buttonContainer.appendChild(checkoutButton);

    cartHeader.appendChild(buttonContainer);
    contentDiv.appendChild(cartHeader);
    main.appendChild(contentDiv);

    this.loadCart();
    // let parent = document.getElementById("cart-item-list");
    const cartItemList = document.createElement("p");

    this.cart.items.forEach((item) => {
      console.log("cart items", this.cart, item);
      this.buildItem(item, contentDiv);
    });
  }

  buildItem(item, parent) {
    let outerDiv = document.createElement("div");
    outerDiv.classList.add("cart-item");

    let div = document.createElement("div");
    outerDiv.appendChild(div);
    let h4 = document.createElement("h4");
    h4.innerText = item.product.name;
    div.appendChild(h4);

    let photoDiv = document.createElement("div");
    photoDiv.classList.add("photo");
    let img = document.createElement("img");
    img.src = `/images/products/${item.product.imageUrl}`;
    img.addEventListener("click", () => {
      showImageDetailForm(item.product.name, img.src);
    });
    photoDiv.appendChild(img);
    let priceH4 = document.createElement("h4");
    priceH4.classList.add("price");
    priceH4.innerText = `$${item.product.price}`;
    photoDiv.appendChild(priceH4);
    outerDiv.appendChild(photoDiv);

    let descriptionDiv = document.createElement("div");
    descriptionDiv.innerText = item.product.description;
    outerDiv.appendChild(descriptionDiv);

    let quantityDiv = document.createElement("div");
    quantityDiv.innerText = `Quantity: ${item.quantity}`;
    outerDiv.appendChild(quantityDiv);
    let removeButton = document.createElement("button");
    removeButton.classList.add("btn", "btn-danger", "btn-sm");
    removeButton.innerText = "Remove";
    removeButton.addEventListener("click", () => {
      if (item.product && item.product.productId) {
        console.log("Removing product ID:", item.product.productId);
        this.removeFromCart(item.product.productId);
      }
      // console.error("Product ID missing in item:", item);
    });
    outerDiv.appendChild(removeButton);

    parent.appendChild(outerDiv);
  }

  clearCart() {
    const url = `${config.baseUrl}/cart`;

    axios
      .delete(url)
      .then((response) => {
        this.cart = {
          items: [],
          total: 0,
        };
        console.log(response.data.message);

        this.cart.total = response.data.total;

        for (const [key, value] of Object.entries(response.data.items)) {
          this.cart.items.push(value);
        }

        this.updateCartDisplay();
        this.loadCartPage();
      })
      .catch((error) => {
        const data = {
          error: "Empty cart failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }

  updateCartDisplay() {
    try {
      const itemCount = this.cart.items.length;
      const cartControl = document.getElementById("cart-items");

      cartControl.innerText = itemCount;
    } catch (e) {}
  }
  removeFromCart(productId) {
    const url = `${config.baseUrl}/cart/products/${productId}`;

    axios
      .delete(url)
      .then((response) => {
        // Update the local cart data
        this.cart = {
          items: [],
          total: 0,
        };

        this.cart.total = response.data.total;

        for (const [key, value] of Object.entries(response.data.items)) {
          this.cart.items.push(value);
        }

        // Refresh the cart UI
        this.updateCartDisplay();
        this.loadCartPage();
        const data = {
          message: `Product has been removed from the cart.`,
        };
        templateBuilder.append("message", data, "errors");
        console.log(`Product ${productId} removed successfully.`);
      })
      .catch((error) => {
        console.error("Failed to remove item:", error);
        const data = {
          error: "Remove item failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }
  checkout() {
    const url = `${config.baseUrl}/orders`;
    axios
      .post(url)
      .then((response) => {
        const order = response.data;
        console.log("Order created successfully:", order);

        // Clear cart and update UI
        this.cart = { items: [], total: 0 };
        this.updateCartDisplay();
        this.loadCartPage();

        const data = {
          message: `Order placed successfully! Order ID: ${order.orderId}`,
        };
        templateBuilder.append("message", data, "errors");
      })
      .catch((error) => {
        console.error("Checkout failed:", error);
        const data = { error: "Checkout failed. Please try again." };
        templateBuilder.append("error", data, "errors");
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cartService = new ShoppingCartService();

  if (userService.isLoggedIn()) {
    console.log("user is logged in, loading cart...");
    cartService.loadCart();
  }
});
