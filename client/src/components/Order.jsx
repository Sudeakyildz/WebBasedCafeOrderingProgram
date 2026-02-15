export default function Order({ orders, onUpdate, onClear, onSubmit }) {
  const totalPrice = Object.entries(orders).reduce(
    (sum, [, { price, quantity }]) => sum + price * quantity,
    0
  )
  const isEmpty = Object.keys(orders).length === 0

  return (
    <section className="order">
      <h2>Siparişiniz</h2>
      <ul id="orderList">
        {isEmpty ? (
          <li>Siparişleriniz burada görünecek.</li>
        ) : (
          Object.entries(orders).map(([itemName, { price, quantity }]) => (
            <li key={itemName}>
              {itemName} - {price}₺ x {quantity}
              <button type="button" onClick={() => onUpdate(itemName, -1)}>
                -
              </button>
              <button type="button" onClick={() => onUpdate(itemName, 1)}>
                +
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="total">
        Toplam: <span id="totalPrice">{totalPrice}</span>₺
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={onClear}>
          Temizle
        </button>
        <button type="button" onClick={onSubmit}>
          Sipariş Ver
        </button>
      </div>
    </section>
  )
}
