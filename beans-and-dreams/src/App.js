import React, { Component } from "react";
import {Routes, Route, Link, BrowserRouter as Router } from "react-router-dom"

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
      products: []
    };
    this.routerRef = React.createRef();
  }

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
          checkout: this.checkout
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
                <b className="navbar-item is-size-4 ">ecommerce</b>
                <label
                  role="button"
                  class="navbar-burger burger"
                  aria-label="menu"
                  aria-expanded="false"
                  data-target="navbarBasicExample"
                  onClick={ e => {
                    e.preventDefault()
                    this.setState({showMenu: !this.state.showMenu});
                  }}
                >
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </label>
              </div>
              <div className={`navbar-menu${
                this.state.showMenu ? "is-active" : ""
              }`}>
                <Link to="/add-product" className="navbar-item">
                  Add Product
                </Link>
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is primary"
                    style={{marginLeft: "5px"}}
                  >
                    {Object.keys(this.state.cart).length}
                  </span>
                </Link>
                {!this.state.user ? (
                  <Link to="/login" className="navbar-item">
                    Login
                  </Link>
                ) : (
                  <Link to="/" onClick={this.logout} className="Navbar-item">
                    Logout
                  </Link>
                )}
              </div>
            </nav>
            <Routes>
              <Route exact path="/"  Component={ProductList}/>
              <Route exact path="/login"  Component={Login}/>
              <Route exact path="/cart"  Component={Cart}/>
              <Route exact path="/add-product"  Component={AddProduct}/>
              <Route exact path="/products"  Component={ProductList}/>
            </Routes>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}