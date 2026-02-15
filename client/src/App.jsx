import { useState, useCallback } from 'react'
import Header from './components/Header'
import Menu from './components/Menu'
import Order from './components/Order'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const [orders, setOrders] = useState({})

  const addToOrder = useCallback((itemName, price) => {
    setOrders((prev) => {
      const next = { ...prev }
      if (next[itemName]) {
        next[itemName].quantity += 1
      } else {
        next[itemName] = { price, quantity: 1 }
      }
      return next
    })
  }, [])

  const updateOrder = useCallback((itemName, change) => {
    setOrders((prev) => {
      const next = { ...prev }
      if (!next[itemName]) return next
      next[itemName].quantity += change
      if (next[itemName].quantity <= 0) delete next[itemName]
      return next
    })
  }, [])

  const clearOrder = useCallback(() => setOrders({}), [])

  const submitOrder = useCallback(async () => {
    if (Object.keys(orders).length === 0) {
      alert('Sipariş vermek için önce ürün ekleyin.')
      return
    }
    const orderData = {
      orderItems: Object.entries(orders).map(([itemName, { price, quantity }]) => ({
        itemName,
        quantity,
        totalPrice: price * quantity,
      })),
      totalAmount: Object.values(orders).reduce(
        (sum, { price, quantity }) => sum + price * quantity,
        0
      ),
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      alert(data.message || 'Sipariş başarıyla kaydedildi!')
      clearOrder()
    } catch (err) {
      console.error(err)
      alert('Bir hata oluştu.')
    }
  }, [orders, clearOrder])

  return (
    <>
      <Header />
      <main className="main-content">
        <Menu onAddToOrder={addToOrder} />
        <Order
          orders={orders}
          onUpdate={updateOrder}
          onClear={clearOrder}
          onSubmit={submitOrder}
        />
      </main>
      <Footer />
    </>
  )
}
