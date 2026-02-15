export default function MenuItem({ item, onAdd }) {
  return (
    <div className="menu-item">
      <img src={item.image} alt={item.name} />
      <div>
        <p>{item.name}</p>
        <span>{item.price}₺</span>
      </div>
      <button type="button" onClick={() => onAdd(item.name, item.price)}>
        Ekle
      </button>
    </div>
  )
}
