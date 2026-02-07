import { useEffect, useRef, useState } from 'react'
import './CustomCursor.css'

const CustomCursor = () => {
    const dotRef = useRef(null)
    const ringRef = useRef(null)
    const [isHovering, setIsHovering] = useState(false)
    const [isClicking, setIsClicking] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window
        if (isMobile) return

        let mouseX = 0, mouseY = 0
        let ringX = 0, ringY = 0

        const onMouseMove = (e) => {
            mouseX = e.clientX
            mouseY = e.clientY
            setIsVisible(true)

            // Dot follows instantly
            if (dotRef.current) {
                dotRef.current.style.left = `${mouseX}px`
                dotRef.current.style.top = `${mouseY}px`
            }
        }

        const animateRing = () => {
            // Ring follows with smooth delay
            ringX += (mouseX - ringX) * 0.12
            ringY += (mouseY - ringY) * 0.12

            if (ringRef.current) {
                ringRef.current.style.left = `${ringX}px`
                ringRef.current.style.top = `${ringY}px`
            }

            requestAnimationFrame(animateRing)
        }

        const onMouseDown = () => setIsClicking(true)
        const onMouseUp = () => setIsClicking(false)
        const onMouseLeave = () => setIsVisible(false)
        const onMouseEnter = () => setIsVisible(true)

        const handleHoverStart = () => setIsHovering(true)
        const handleHoverEnd = () => setIsHovering(false)

        const attachListeners = () => {
            document.querySelectorAll('a, button, input, textarea, [role="button"], .card, .feature-card, .nav-link').forEach(el => {
                el.removeEventListener('mouseenter', handleHoverStart)
                el.removeEventListener('mouseleave', handleHoverEnd)
                el.addEventListener('mouseenter', handleHoverStart)
                el.addEventListener('mouseleave', handleHoverEnd)
            })
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mouseleave', onMouseLeave)
        document.addEventListener('mouseenter', onMouseEnter)
        attachListeners()
        animateRing()

        const observer = new MutationObserver(attachListeners)
        observer.observe(document.body, { childList: true, subtree: true })

        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mouseup', onMouseUp)
            document.removeEventListener('mouseleave', onMouseLeave)
            document.removeEventListener('mouseenter', onMouseEnter)
            observer.disconnect()
        }
    }, [])

    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window)) {
        return null
    }

    return (
        <>
            {/* Small dot - follows instantly */}
            <div
                ref={dotRef}
                className={`cursor-dot ${isHovering ? 'hover' : ''} ${isClicking ? 'click' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
            />
            {/* Outer ring - follows with delay */}
            <div
                ref={ringRef}
                className={`cursor-ring ${isHovering ? 'hover' : ''} ${isClicking ? 'click' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
            />
        </>
    )
}

export default CustomCursor
