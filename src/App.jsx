import React, { useRef, useState, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'
import './App.css' // only if you have a tailwind or shimmer background in here
import classicGoldImg from './assets/classic-g.png'
import technoDreamImg from './assets/techno-dream.png'
import rubyGoldImg from './assets/ruby-gold.png'
import tropicalHeat from './assets/tropical-heat.png'
import wildMountainWestImg from './assets/wild-mountain-west.png'
import celebrityRowImg from './assets/celebrity-row.png'
// …

const NAMES   = ['judy','thomas','alex','emily','michael','sarah','daniel','jenny','brian','laura','chris','olivia'];
const AMOUNTS = ['$500','$1,000','$2,500','$5,000','$10,000','$25,000','$50,000','$100,000','$500,000','$1M'];
const CITIES  = ['san francisco','los angeles','sacramento','san diego','san jose','oakland','fresno','santa barbara','long beach','bakersfield'];

// generate 45 random winner strings once
const WINNERS = Array.from({ length: 45 }, () => {
  const name   = NAMES[ Math.floor(Math.random()*NAMES.length) ];
  const amount = AMOUNTS[ Math.floor(Math.random()*AMOUNTS.length) ];
  const city   = CITIES[ Math.floor(Math.random()*CITIES.length) ];
  // capitalize first letter of name & city
  const nm = name[0].toUpperCase()+name.slice(1);
  const ct = city.split(' ')
                 .map(w => w[0].toUpperCase()+w.slice(1))
                 .join(' ');
  return `${nm} - ${amount} - ${ct}`;
});

function LastWinnersTicker() {
  return (
    <div className="w-max overflow-hidden py-1 mt-12 ">
      <div className="inline-block font-bungee whitespace-nowrap animate-marquee">
      {[...WINNERS, ...WINNERS].map((w, i) => (
          <span
            key={i}
            className="inline-block px-6 text-sm sm:text-base text-white font-semibold uppercase"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function PaymentModal({ onClose, onPay }) {
  return (
    <div className="fixed inset-0 bg-black text-gray-700 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-blue-100 shadow-xl p-6 rounded-2xl w-[320px] sm:w-[400px] flex flex-col items-center">
        <h2 className="text-lg font-bold text-gray-700 mb-2">Buy your digital ticket!</h2>
        <p className="text-gray-700 mb-4 text-center">
          Enter payment details to purchase a Scratcher.
        </p>

        {/* pretend payment form */}
        <input
          type="text"
          placeholder="card number"
          className="mb-2 w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          type="text"
          placeholder="expiration date"
          className="mb-2 w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          type="text"
          placeholder="cvc"
          className="mb-4 w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />

        {/* payment action buttons */}
        <div className="flex gap-2">
        <button
            onClick={onPay}
            className="bg-gray-200 text-gray-200 rounded-full px-4 py-2 hover:-translate-y-1 transition-transform"
          >
            Pay now
          </button>

          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-200 rounded-full px-4 py-2 hover:-translate-y-1 transition-transform"
          >
            Cancel
          </button>
          
        </div>
      </div>
    </div>
  )
}

function ScratchableSquare({ value, size = 96, disabled}) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e) => {
    if (disabled) return 
    e.preventDefault()
    setIsDrawing(true)
    setLastPos(getCoords(e))
  }

  const draw = (e) => {
    if (disabled) return 
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineWidth = 20
    ctx.strokeStyle = 'rgba(0,0,0,1)'

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    const newPos = getCoords(e)
    ctx.lineTo(newPos.x, newPos.y)
    ctx.stroke()
    setLastPos(newPos)
  }

  const stopDrawing = () => setIsDrawing(false)

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, '#F0EDE4')
    grad.addColorStop(1, '#F0EDE4')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }, [size])

  return (
    <div className='relative' style={{ width: size, height: size }}>
      <div className='w-full h-full bg-opacity-20 flex items-center justify-center rounded-xl shadow'>
        <span className='text-sm sm:text-lg text-black font-semibold z-0'>
          {value}
        </span>
        <canvas
          ref={canvasRef}
          className='absolute top-0 left-0 rounded-xl'
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  )
}

// single ticket with scratchers
function Ticket({ ticket, onFlipBack, paid }) {
  const { title, marketingMsg, expectedReturn, bgImage, price } = ticket
  const [flipped, setFlipped] = useState(false)

  const frontSpring = useSpring({
    transform: `perspective(800px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  })

  const backSpring = useSpring({
    transform: `perspective(800px) rotateY(${flipped ? 0 : -180}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  })

  const scratchValues = ['$10', '$50', '$100', '$1,000', '$10,000', '$1,000', "$25", "$5000", "$1M"]

  return (
    <div
      className='relative'
      style={{ width: 400, height: 500|| '#fff' }}
    >
      {/* front side */}
      <animated.div
        className='absolute w-full h-full shadow-xl p-6 rounded-2xl bg-cover bg-center'
        style={{ ...frontSpring, backfaceVisibility: 'hidden', backgroundImage: `url(${ticket.bgImage})`}}
      >
        {/* price‐badge in top right */}
      <div
      className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center z-10"
      >
        <span className="text-xs font-bold text-white">{price}</span>
      </div>
        
        <h2 className='text-center mb-1 text-gray-700 uppercase'>
          {ticket.title}
        </h2>
        <p className='text-center mb-2 text-gray-700 italic'>
          {ticket.marketingMsg}
        </p>
        <p className='text-center mb-4 text-gray-700 text-sm'>
          Expected return: {Math.round(ticket.expectedReturn * 100)}%
        </p>
        <div className='grid grid-cols-3 gap-4 mb-10'>
          {scratchValues.map((val, idx) => (
            <ScratchableSquare key={idx} value={val} disabled={!paid}/>
          ))}
        </div>
        <button
          className='absolute bottom-2 right-4 w-10 h-8 rounded-full bg-gray-600 text-white cursor-pointer transition-transform hover:-translate-y-1 flex items-center justify-center'
          onClick={() => setFlipped(true)}
        >
          info
        </button>
        <button
          className='absolute bottom-2 left-4 w-10 h-8 rounded-full bg-indigo-600 text-white cursor-pointer transition-transform hover:-translate-y-1 flex items-center justify-center'
          onClick={onFlipBack}
        >
          x
        </button>
      </animated.div>

      {/* back side */}
      <animated.div
        className='absolute w-full h-full flex items-center justify-center rounded-2xl'
        style={{ ...backSpring, backfaceVisibility: 'hidden', backgroundColor: '#ffe4e6' }}
      >
        <div className='flex flex-col items-center'>
          <h1 className='text-xl font-semibold text-gray-700'>Ticket details</h1>
          <p className='text-gray-700 mt-2 text-center px-4'>
          {ticket.winInfo} Keep scratching responsibly.
          </p>
        </div>
        <button
          className='absolute bottom-4 right-4 w-10 h-10 rounded-full bg-gray-700 text-white cursor-pointer transition-transform hover:-translate-y-1 flex items-center justify-center'
          onClick={() => setFlipped(false)}
        >
          flip
        </button>
      </animated.div>
    </div>
  )
}

// deck or selection ui
export default function App() {
  const TICKETS = [
    {
      id: 'classic-gold',
      title: 'Classic Gold',
      price: '$1',
      marketingMsg: 'go for gold!',
      winInfo: 'Uncover three of the same, get a shed full of gold bars!',
      expectedReturn: 0.78,
      bgColor: '#fea01a',
      bgImage: classicGoldImg,
    },
    {
      id: 'celebrity-row',
      title: 'Celebrity Row',
      price: '$2',
      marketingMsg: 'Shoot for the stars!',
      winInfo: 'Find three stars and live among the stars, courtside at a Lakers game!',
      expectedReturn: 0.82,
      bgColor: '#c9a0dc',
      bgImage: celebrityRowImg,
    },
    {
      id: 'tropical-heat',
      title: 'Tropical Heat',
      price: '$10',
      marketingMsg: 'Feel the island vibes!',
      winInfo: 'Uncover three islands and you will find yourself beachside in Hawaii!',
      expectedReturn: 0.75,
      bgColor: '#fed7aa',
      bgImage: tropicalHeat,
    },
    {
      id: 'wild mountain west',
      title: 'Wild Mountain West',
      price: '$5',
      marketingMsg: 'Saddle up for big wins!',
      winInfo: 'No horsing around, uncover two of the same prize, win an RV trip to explore the Old West!',
      expectedReturn: 0.7,
      bgColor: '#fcd34d',
      bgImage: wildMountainWestImg,
    },
    {
      id: 'big-royal-ruby',
      title: 'Big Royal Ruby',
      price: '$20',
      marketingMsg: 'Experience lavish elegance!',
      winInfo: 'Uncover two house symbols & experience elegance in your own custom built home. Your house goals, now!',
      expectedReturn: 0.85,
      bgColor: '#fecaca',
      bgImage: rubyGoldImg,
    },
    {
      id: 'techno-dream',
      title: 'Techno Dream',
      price: '$40',
      marketingMsg: 'Dream the night away!',
      winInfo: 'Tour the world for a year with your favorite electronic artists. All Expenses Paid!',
      expectedReturn: 0.77,
      //bgColor: '#a5f3fc',
      bgImage: technoDreamImg,
    }
  ]

  const [selected, setSelected] = useState(null) //counter for "Purchase History"
  const [stats, setStats] = useState({
    picks: {}
  })

  const sortedTickets = Object.entries(stats.picks).sort((a, b) => b[1] - a[1]);

  // new states:
  const [paid, setPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleSelect = (ticketId) => {
    setSelected(ticketId)
    setStats((prev) => ({
      ...prev,
      picks: {
        ...prev.picks,
        [ticketId]: (prev.picks[ticketId] || 0) + 1
      }
    }))
    // if not paid, show the payment modal
    if (!paid) {
      setShowPaymentModal(true)
    }
  }

  const handlePay = () => {
    setPaid(true)
    setShowPaymentModal(false)
  }

  return (
    <div className="shimmer-bg min-h-screen flex flex-col items-center justify-center p-4">
      {/* show the payment modal if needed */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPay={handlePay}
        />
      )}

      {!selected && (
        <div className="mb-8 text-center text-white">
          <h1 className="font-bungee text-2xl font-bold mb-4">DD's Market</h1>
          <p className="text-base">
            <span className="font-bungee text-sm italic">*Disclaimer: This is a demo app. No real money involved.</span>
          </p>
        </div>
      )}

      {/* your TICKETS grid (like you have) */}
      {!selected ? (
        <div className="grid grid-cols-3 gap-6">
          {TICKETS.map((t) => (
            <div
              key={t.id}
              className="relative cursor-pointer p-4 bg-gray-100 rounded-xl hover:shadow-xl hover:-translate-y-1 transition"
              style={{ width: 170, height: 200, backgroundImage: `url(${t.bgImage})` }}
              //style={{ width: 120, height: 150, backgroundColor: t.bgColor }}
              onClick={() => handleSelect(t.id)}
            >
              {/* price badge in the corner */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center z-10">
                <span className="text-xs font-bold text-white">{t.price}</span>
              </div>

              <p className="font-bungee text-center font-semibold text-gray-700 p-3">
                {t.title}
              </p>
              <p className="text-center text-sm italic text-white">
                {Math.round(t.expectedReturn * 100)}% return
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Ticket
            ticket={TICKETS.find((t) => t.id === selected)}
            onFlipBack={() => setSelected(null)}
            paid={paid} // pass this down
          />
        </div>
      )}
      
      {/* analysis snippet, same as you had */}
      <div className="bg-purple-100 text-black p-4 mt-8 rounded-xl w-96">
        <h2 className="text-lg font-bold mb-2 mt-2">Purchase History:</h2>
        {sortedTickets.length < 1 && <p>No purchases today. Feeling Lucky?</p>}
        {sortedTickets.map(([ticketId, count]) => {
          const ticket = TICKETS.find((t) => t.id === ticketId)
          return (
            <div key={ticketId} className="flex justify-between mb-1">
              <span>{ticket?.title}</span>
              <span>{count} picks</span>
            </div>
          )
        })}
      </div>
      {/* last winners ticker */}
      <LastWinnersTicker />
    </div>
  )
}

