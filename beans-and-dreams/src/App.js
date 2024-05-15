import React, { Component } from "react";
import { Routes, Route, Link, BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import AddProduct from "./components/AddProduct";
import Cart from "./components/Cart";
import Login from "./components/Login";
import ProductList from "./components/ProductList";

import Context from "./Context";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      count: 0,
      products: [],
    };
    this.routerRef = React.createRef();
  }

  async componentDidMount() {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");

    const products = await axios.get("http://localhost:3001/products");
    user = user ? JSON.parse(user) : null;
    cart = cart ? JSON.parse(cart) : {};

    this.setState({ user, products: products.data, cart });
  }

  login = async (email, password) => {
    const res = await axios
      .post("http://localhost:3001/login", { email, password })
      .catch((res) => {
        return { status: 401, message: "Unauthorized" };
      });

    if (res.status === 200) {
      const { email } = jwtDecode(res.data.accessToken);
      const user = {
        email,
        token: res.data.accesstoken,
        accessLevel: email === "admin@example.com" ? 0 : 1,
      };

      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  };

  logout = (e) => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };

  addProduct = (product, callback) => {
    let products = this.state.products.slice();
    products.push(product);
    this.setState({ products }, () => callback && callback());
  };

  addToCart = (cartItem) => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    this.state.count += 1
    console.log(this.state.count);

    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  removeFromCart = (cartItemId) => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  clearCart = () => {
    let cart = {};
    let count = 0
    localStorage.removeItem("cart");
    this.setState({ cart, count });
  };

  checkout = () => {
    if (!this.state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }

    const cart = this.state.cart;

    const products = this.state.products.map((p) => {
      if (cart[p.name]) {
        // p.stock = p.stock - cart[p.name].amount;

        axios.put(`http://localhost:3001/products/${p.id}`, { ...p });
      }
      return p;
    });

    this.setState({ products });
    this.clearCart();
  };

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout,
        }}
      >
        <Router ref={this.routerRef}>
          <div className="App">
            <nav
              className="navbar container"
              role="navigation"
              aria-label="main navigation"
            >
              <div className="navbar-brand">
                <b className="navbar-item is-size-4 ">Beans and Dreams</b>
                <label
                  role="button"
                  className="navbar-burger burger"
                  aria-label="menu"
                  aria-expanded="false"
                  data-target="navbarBasicExample"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ showMenu: !this.state.showMenu });
                  }}
                >
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </label>
              </div>
              <div
                className={`navbar-menu${
                  this.state.showMenu ? "is-active" : ""
                }`}
              >
                <Link to="/products" className="navbar-item">
                  Drinks and Food
                </Link>
                <Link to="/add-product" className="navbar-item">
                  Add Menu Item
                </Link>
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is primary"
                    style={{ marginLeft: "5px" }}
                  >
                    {this.state.count}
                  </span>
                </Link>
                {!this.state.user ? (
                  <Link to="/login" className="navbar-item navbar-end button is-primary">
                    Login
                  </Link>
                ) : (
                  <Link to="/" onClick={this.logout} className="Navbar-item navbar-end button">
                    Logout
                  </Link>
                )}
              </div>
            </nav>
            <Routes>
              <Route exact path="/" Component={ProductList} />
              <Route exact path="/login" Component={Login} />
              <Route exact path="/cart" Component={Cart} />
              <Route exact path="/add-product" Component={AddProduct} />
              <Route exact path="/products" Component={ProductList} />
            </Routes>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}
