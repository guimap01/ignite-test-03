import React from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';

const Header = (): JSX.Element => {
  const { cart } = useCart();
  const cartSize = cart.reduce((acc, cartItem) => {
    const itemAmount = acc.get(cartItem.id);
    if (itemAmount) {
      acc.set(cartItem.id, itemAmount + 1);
      return acc;
    }
    acc.set(cartItem.id, 1);
    return acc;
  }, new Map());

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize.size === 1
              ? `${cartSize.size} item`
              : `${cartSize.size} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
