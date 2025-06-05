import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getImageUrl } from './supabaseClient'

const App = () => {
  const [name, setName] = useState('')
  const [stylizedName, setStylizedName] = useState([])
  const [error, setError] = useState('')
  const [letterStyles, setLetterStyles] = useState({})
  const [usedStyles, setUsedStyles] = useState({})
  const [imageCache, setImageCache] = useState({})
  const [loadingImages, setLoadingImages] = useState(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const resultRef = useRef(null)
  const [titleLetters, setTitleLetters] = useState([])
  const [allUsedStyles, setAllUsedStyles] = useState(new Set())
  const [isPreloading, setIsPreloading] = useState(false)
  const preloadedImagesRef = useRef(new Set())
  const imageLoadQueueRef = useRef([])
  const isProcessingQueueRef = useRef(false)
  const [showResult, setShowResult] = useState(false)

  // Add decorative elements configuration
  const DECORATIVE_ELEMENTS = {
    specialChars: [
      { type: 'exclamation', count: 8 },
      { type: 'question', count: 16 },
      { type: 'dollar', count: 10 },
      { type: 'percent', count: 11 },
      { type: 'plus', count: 5 },
      { type: 'equals', count: 3 },
      { type: 'number', count: 6 },
      { type: 'yen', count: 3 },
      { type: 'trademark', count: 4 },
      { type: 'tilde', count: 4 },
      { type: 'slash', count: 5 },
      { type: 'semicolon', count: 6 },
      { type: 'registered_trademark', count: 3 },
      { type: 'quotation_mark', count: 7 },
      { type: 'pound', count: 3 },
      { type: 'parenthesis', count: 6 },
      { type: 'euro', count: 4 },
      { type: 'ellipsis', count: 3 }
    ],
    shapes: [
      { type: 'star', count: 2 },
      { type: 'flash', count: 2 },
      { type: 'arrow', count: 18 },
      { type: 'emoji', count: 4 },
      { type: 'skull', count: 1 }
    ],
    words: [
      'WOW', 'Super', 'Cool', 'Hot', 'New', 'Free', 'Best', 'Amazing',
      'Premium', 'Special', 'Sexy', 'Sale', 'Out_Now', 'Only', 'OMG',
      'OFF', 'Fresh', 'Exclusive', 'Biggest'
    ]
  }

  // Add state for decorative elements
  const [decorativeElements, setDecorativeElements] = useState([])
  const [visibleElements, setVisibleElements] = useState(new Set())

  // Function to get random number between 1 and max
  const getRandomNumber = (max) => Math.floor(Math.random() * max) + 1

  // Function to get random position
  const getRandomPosition = () => {
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`
    }
  }

  // Function to get random delay
  const getRandomDelay = () => Math.random() * 5 // 0-5 seconds

  // Function to get image path
  const getDecorativeImagePath = (type, category) => {
    const number = getRandomNumber(DECORATIVE_ELEMENTS[category].find(t => t.type === type)?.count || 1)
    const paddedNumber = number.toString().padStart(2, '0')
    
    let path
    switch (category) {
      case 'specialChars':
        path = `_Special Characters/${type}_Sign_${paddedNumber}.png`
        break
      case 'shapes':
        path = `_Shapes/${type}_${paddedNumber}.png`
        break
      case 'words':
        path = `_Words/${type}.png`
        break
      default:
        return null
    }
    
    return getImageUrl(path)
  }

  // Initialize decorative elements
  useEffect(() => {
    const elements = []
    
    // Add special characters
    DECORATIVE_ELEMENTS.specialChars.forEach(char => {
      const count = Math.floor(Math.random() * 2) + 1 // 1-2 instances of each
      for (let i = 0; i < count; i++) {
        elements.push({
          id: `char-${char.type}-${i}`,
          type: 'specialChar',
          category: 'specialChars',
          charType: char.type,
          style: getRandomPosition(),
          className: 'w-8 h-8 opacity-0 transition-opacity duration-1000',
          delay: getRandomDelay()
        })
      }
    })

    // Add shapes
    DECORATIVE_ELEMENTS.shapes.forEach(shape => {
      const count = Math.floor(Math.random() * 2) + 1 // 1-2 instances of each
      for (let i = 0; i < count; i++) {
        elements.push({
          id: `shape-${shape.type}-${i}`,
          type: 'shape',
          category: 'shapes',
          shapeType: shape.type,
          style: getRandomPosition(),
          className: 'w-10 h-10 opacity-0 transition-opacity duration-1000',
          delay: getRandomDelay()
        })
      }
    })

    // Add words
    DECORATIVE_ELEMENTS.words.forEach(word => {
      if (Math.random() > 0.7) { // 30% chance to add each word
        elements.push({
          id: `word-${word}-${Math.random()}`,
          type: 'word',
          category: 'words',
          wordType: word,
          style: getRandomPosition(),
          className: 'w-24 h-12 opacity-0 transition-opacity duration-1000',
          delay: getRandomDelay()
        })
      }
    })

    setDecorativeElements(elements)
  }, [])

  // Handle element visibility
  useEffect(() => {
    const showElements = () => {
      decorativeElements.forEach(element => {
        setTimeout(() => {
          setVisibleElements(prev => new Set([...prev, element.id]))
        }, element.delay * 1000)
      })
    }

    showElements()
  }, [decorativeElements])

  // Render decorative element
  const renderDecorativeElement = (element) => {
    const imagePath = getDecorativeImagePath(
      element.type === 'word' ? element.wordType : 
      element.type === 'specialChar' ? element.charType : 
      element.shapeType,
      element.category
    )

    const isVisible = visibleElements.has(element.id)
    const opacityClass = isVisible ? 'opacity-20 hover:opacity-40' : 'opacity-0'

    return (
      <img
        src={imagePath}
        alt="decoration"
        className={`absolute pointer-events-none ${element.className} ${opacityClass}`}
        style={element.style}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
    )
  }

  // Update title letter styles to use different numbers for repeated letters
  const TITLE_LETTER_STYLES = {
    // First line: RANSOM TEXT
    'R': 9, 'A': 2, 'N': 5, 'S': 4, 'O': 5, 'M': 6, 
    'T': 7, 'E': 8, 'X': 9,
    // Second line: GENERATOR (using different styles for repeated letters)
    'G': 11, 'E2': 3, 'N2': 19, 'E3': 12, 'R2': 14, 'A2': 12, 'T2': 16, 'O2': 17, 'R3': 18
  }

  // Update getTitleLetterImagePath to handle repeated letters
  const getTitleLetterImagePath = useCallback((char, index) => {
    let styleKey = char
    // Handle repeated letters in the title
    if (char === 'E' && index > 7) {
      styleKey = index === 8 ? 'E2' : 'E3'
    } else if (char === 'N' && index > 7) {
      styleKey = 'N2'
    } else if (char === 'R' && index > 7) {
      styleKey = index === 12 ? 'R2' : 'R3'
    } else if (char === 'A' && index > 7) {
      styleKey = 'A2'
    } else if (char === 'T' && index > 7) {
      styleKey = 'T2'
    } else if (char === 'O' && index > 7) {
      styleKey = 'O2'
    }

    const styleNumber = TITLE_LETTER_STYLES[styleKey]
    if (!styleNumber) return null
    const paddedNumber = styleNumber.toString().padStart(2, '0')
    return getImageUrl(`${char}/${char}_${paddedNumber}.png`)
  }, [])

  // Simple function to get a random style number
  const getRandomStyleNumber = useCallback(() => {
    return Math.floor(Math.random() * 55) + 1
  }, [])

  const isValidLetter = useCallback((char) => {
    return /^[A-Z0-9]$/.test(char)
  }, [])

  // Direct function to get image path
  const getImagePath = useCallback((char, styleNumber) => {
    if (!isValidLetter(char)) {
      return null
    }
    const paddedNumber = styleNumber.toString().padStart(2, '0')
    return getImageUrl(`${char}/${char}_${paddedNumber}.png`)
  }, [isValidLetter])

  const getNewStyleForLetter = useCallback((char) => {
    if (!usedStyles[char]) {
      usedStyles[char] = new Set()
    }

    let styleNumber
    let attempts = 0
    const maxAttempts = 55 // Maximum number of styles available

    do {
      styleNumber = getRandomStyleNumber()
      // Skip if the style is used anywhere on the page
      if (allUsedStyles.has(styleNumber)) {
        continue
      }
      attempts++
      // If we've tried all styles, reset the used styles for this letter
      if (attempts >= maxAttempts) {
        usedStyles[char] = new Set()
        // Try to find any unused style
        for (let i = 1; i <= 55; i++) {
          if (!allUsedStyles.has(i)) {
            styleNumber = i
            break
          }
        }
        break
      }
    } while (usedStyles[char].has(styleNumber))

    // Add the new style to both sets
    setUsedStyles(prev => ({
      ...prev,
      [char]: new Set([...prev[char], styleNumber])
    }))
    setAllUsedStyles(prev => new Set([...prev, styleNumber]))

    return styleNumber
  }, [getRandomStyleNumber, usedStyles, allUsedStyles])

  // Add a function to process the image load queue
  const processImageLoadQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || imageLoadQueueRef.current.length === 0) return

    isProcessingQueueRef.current = true
    const batchSize = 5 // Process 5 images at a time
    const batch = imageLoadQueueRef.current.splice(0, batchSize)

    try {
      await Promise.all(
        batch.map(async ({ imagePath, resolve, reject }) => {
          try {
            if (preloadedImagesRef.current.has(imagePath)) {
              resolve()
              return
            }

            const img = new Image()
            await new Promise((resolveImg, rejectImg) => {
              img.onload = () => {
                preloadedImagesRef.current.add(imagePath)
                setImageCache(prev => ({ ...prev, [imagePath]: true }))
                setLoadingImages(prev => {
                  const next = new Set(prev)
                  next.delete(imagePath)
                  return next
                })
                resolveImg()
              }
              img.onerror = (error) => {
                setLoadingImages(prev => {
                  const next = new Set(prev)
                  next.delete(imagePath)
                  return next
                })
                rejectImg(error)
              }
              img.src = imagePath
              setLoadingImages(prev => new Set(prev).add(imagePath))
            })
            resolve()
          } catch (error) {
            console.warn(`Failed to load image: ${imagePath}`, error)
            reject(error)
          }
        })
      )
    } catch (error) {
      console.warn('Error processing image batch:', error)
    } finally {
      isProcessingQueueRef.current = false
      if (imageLoadQueueRef.current.length > 0) {
        processImageLoadQueue()
      }
    }
  }, [])

  // Optimize preloadImage function
  const preloadImage = useCallback((imagePath) => {
    if (!imagePath) return Promise.resolve()
    if (preloadedImagesRef.current.has(imagePath)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        imageLoadQueueRef.current.push({ imagePath, resolve, reject })
        processImageLoadQueue()
      } catch (error) {
        console.warn(`Error queueing image for preload: ${imagePath}`, error)
        reject(error)
      }
    })
  }, [processImageLoadQueue])

  const generateStylizedName = useCallback((inputName) => {
    const upperName = inputName.toUpperCase()
    const result = []
    const newStyles = { ...letterStyles }
    
    for (let i = 0; i < upperName.length; i++) {
      const char = upperName[i]
      
      if (char === ' ') {
        result.push({ type: 'space' })
        continue
      }

      if (!isValidLetter(char)) {
        result.push({ type: 'invalid', char })
        continue
      }

      if (!newStyles[char]) {
        newStyles[char] = getNewStyleForLetter(char)
      }

      const imagePath = getImagePath(char, newStyles[char])
      if (imagePath) {
        result.push({ type: 'letter', image: imagePath, char })
        // Preload the image
        preloadImage(imagePath).catch((error) => {
          console.warn(`Failed to preload image for ${char}:`, error)
          // If preload fails, try a different style
          const newStyle = getNewStyleForLetter(char)
          newStyles[char] = newStyle
          const newImagePath = getImagePath(char, newStyle)
          if (newImagePath) {
            preloadImage(newImagePath).catch((error) => {
              console.warn(`Failed to preload fallback image for ${char}:`, error)
            })
          }
        })
      }
    }
    
    setLetterStyles(newStyles)
    return result
  }, [getImagePath, getNewStyleForLetter, isValidLetter, letterStyles, preloadImage])

  const handleNameChange = useCallback((e) => {
    const inputName = e.target.value
    setName(inputName)
    setShowResult(false)
    setError('')
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!name.trim()) {
      setError('Please enter some text')
      return
    }

    setIsGenerating(true)
    setShowResult(false)
    
    try {
      const upperName = name.toUpperCase()
      const result = []
      const newStyles = { ...letterStyles }
      
      // Process each letter in the input
      for (let i = 0; i < upperName.length; i++) {
        const char = upperName[i]
        
        if (char === ' ') {
          result.push({ type: 'space' })
          continue
        }

        if (!isValidLetter(char)) {
          result.push({ type: 'invalid', char })
          continue
        }

        // Get a random style for this letter
        const styleNumber = getRandomStyleNumber()
        newStyles[char] = styleNumber
        
        // Get the image path for this letter and style
        const imagePath = getImagePath(char, styleNumber)
        if (imagePath) {
          result.push({ type: 'letter', image: imagePath, char })
        }
      }
      
      setLetterStyles(newStyles)
      setStylizedName(result)
      setShowResult(true)
    } catch (error) {
      console.warn('Error generating stylized name:', error)
      setError('Failed to generate stylized text. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [name, letterStyles, getRandomStyleNumber, getImagePath, isValidLetter])

  const handleImageError = useCallback((char, imagePath) => {
    console.warn(`Failed to load image for letter: ${char}`, imagePath)
    const newStyles = { ...letterStyles }
    
    // Try a different random style for this letter
    newStyles[char] = getRandomStyleNumber()
    setLetterStyles(newStyles)
    
    // Regenerate the name with the new style
    if (name) {
      handleGenerate()
    }
  }, [letterStyles, getRandomStyleNumber, name, handleGenerate])

  // Generate title letters
  useEffect(() => {
    const title = "NAME ART GENERATOR"
    const styles = {}
    const letters = []

    for (const char of title) {
      if (char === ' ') {
        letters.push({ type: 'space' })
        continue
      }
      if (isValidLetter(char)) {
        styles[char] = getRandomStyleNumber()
        const imagePath = getImagePath(char, styles[char])
        if (imagePath) {
          letters.push({ type: 'letter', image: imagePath, char })
        }
      }
    }
    setTitleLetters(letters)
  }, [])

  // Add loading indicator to the result section
  const resultSection = useMemo(() => (
    <div className="flex flex-wrap justify-center items-center gap-3 p-8 bg-black/10 rounded-2xl min-h-[200px]">
      {isPreloading ? (
        <div className="flex items-center gap-3 text-white/80">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading letters...</span>
        </div>
      ) : (
        stylizedName.map((item, index) => {
          if (item.type === 'space') {
            return <span key={index} className="w-6 inline-block"></span>
          }
          if (item.type === 'invalid') {
            return (
              <span 
                key={index} 
                className="px-3 py-1 text-white font-bold text-lg rounded"
              >
                {item.char}
              </span>
            )
          }
          const isLoading = loadingImages.has(item.image)
          return (
            <div 
              key={index} 
              className={`transform transition-all duration-300 ${
                isLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
              } hover:scale-110`}
            >
              <img 
                src={item.image}
                alt={item.char}
                className="h-20 w-auto object-contain drop-shadow-lg"
                onError={() => handleImageError(item.char, item.image)}
                loading="eager"
              />
            </div>
          )
        })
      )}
    </div>
  ), [stylizedName, loadingImages, handleImageError, isPreloading])

  const downloadNameArt = useCallback(async () => {
    if (!stylizedName.length || isDownloading) return

    setIsDownloading(true)
    try {
      // Create a zip file
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      // Create a folder for the images
      const folder = zip.folder("name-art")

      // Download each letter image
      const downloadPromises = stylizedName.map(async (item, index) => {
        if (item.type === 'letter') {
          try {
            const response = await fetch(item.image)
            const blob = await response.blob()
            const fileName = `${item.char}_${index + 1}.png`
            folder.file(fileName, blob)
          } catch (error) {
            console.error(`Failed to download image for ${item.char}:`, error)
          }
        }
      })

      // Wait for all downloads to complete
      await Promise.all(downloadPromises)

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name || 'name'}-art.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to generate download. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }, [stylizedName, name, isDownloading])

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat relative overflow-hidden" style={{ backgroundImage: "url('/bg-2.jpg')" }}>
      {/* Decorative Elements */}
      {decorativeElements.map((element) => (
        <div key={element.id}>
          {renderDecorativeElement(element)}
        </div>
      ))}

      <div className="max-w-5xl mx-auto p-8 relative">
        <div className="flex flex-col items-center space-y-16">
          {/* Title */}
          <div className="flex flex-col items-center gap-1 mb-4 relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-white/40"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-white/40"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-white/40"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-white/40"></div>
            
            {/* First line: RANSOM TEXT */}
            <div className="flex items-center gap-1">
              {['R', 'A', 'N', 'S', 'O', 'M','E', ' ', 'T', 'E', 'X', 'T'].map((char, index) => {
                if (char === ' ') {
                  return <span key={index} className="w-4 inline-block"></span>
                }
                const imagePath = getTitleLetterImagePath(char, index)
                return (
                  <div 
                    key={index} 
                    className="transform transition-all duration-300 hover:scale-110"
                  >
                    <img 
                      src={imagePath}
                      alt={char}
                      className="h-12 w-auto object-contain drop-shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        console.error(`Failed to load image for title letter: ${char}`)
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Second line: GENERATOR */}
            <div className="flex items-center gap-1">
              {['G', 'E', 'N', 'E', 'R', 'A', 'T', 'O', 'R'].map((char, index) => {
                const imagePath = getTitleLetterImagePath(char, index + 11) // Offset index for second line
                return (
                  <div 
                    key={index} 
                    className="transform transition-all duration-300 hover:scale-110"
                  >
                    <img 
                      src={imagePath}
                      alt={char}
                      className="h-12 w-auto object-contain drop-shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        console.error(`Failed to load image for title letter: ${char}`)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Input Section */}
          <div className="w-full max-w-md space-y-4">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter Text"
              className="w-full px-6 py-4 text-lg border-2 border-white/30 rounded-xl focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 transition-all bg-black/20 text-white placeholder-white/70 shadow-lg"
            />
            
            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !name.trim()}
              className={`w-full px-6 py-4 text-lg font-bold rounded-xl transition-all duration-300 
                ${isGenerating || !name.trim()
                  ? 'bg-gray-500/10 cursor-not-allowed'
                  : 'bg-transparent hover:bg-white/5 transform hover:scale-105'
                } 
                text-white shadow-lg backdrop-blur-sm
                relative overflow-hidden group
                border-2 border-white/30 hover:border-white/50`}
            >
              <div className="relative flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="tracking-wide text-white/80">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-6 w-6 transform group-hover:translate-y-[-2px] transition-transform text-white/80" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <span className="tracking-wide text-white/80 group-hover:text-white transition-colors">Generate</span>
                  </>
                )}
              </div>
            </button>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 bg-red-900/30 px-4 py-2 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>

          {/* Result Section */}
          {showResult && (
            <div className="flex flex-col items-center w-full">
              <div ref={resultRef} className="flex flex-wrap justify-center items-center gap-3 p-8 bg-black/10 rounded-2xl">
                {resultSection}
              </div>

              {/* Download Button */}
              {stylizedName.length > 0 && (
                <button
                  onClick={downloadNameArt}
                  disabled={isDownloading}
                  className={`mt-8 px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 
                    ${isDownloading
                      ? 'bg-gray-500/10 cursor-not-allowed'
                      : 'bg-transparent hover:bg-white/5 transform hover:scale-105'
                    } 
                    text-white shadow-lg backdrop-blur-sm
                    relative overflow-hidden group
                    border-2 border-white/30 hover:border-white/50`}
                >
                  <div className="relative flex items-center gap-3">
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-6 w-6 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="tracking-wide text-white/80">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-6 w-6 transform group-hover:translate-y-[-2px] transition-transform text-white/80" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        <span className="tracking-wide text-white/80 group-hover:text-white transition-colors">Download Letters</span>
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Usage Guide and Download Instructions */}
          <div className="w-full max-w-2xl mt-16 p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 relative overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/20"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/20"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/20"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/20"></div>

            <h2 className="text-3xl font-bold text-white mb-8 text-center relative">
              <span className="relative z-10">How to Use</span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </h2>
            
            {/* Usage Steps */}
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90 transition-colors">Enter Your Text</h3>
                  <p className="text-white/80 leading-relaxed">Type any text in the input field above. The generator will automatically convert it into stylized ransom note letters.</p>
                  <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90 transition-colors">Preview Your Text</h3>
                  <p className="text-white/80 leading-relaxed">Watch as your text is transformed into unique ransom note style letters. Each letter will be different, even if repeated.</p>
                  <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90 transition-colors">Download Your Letters</h3>
                  <p className="text-white/80 leading-relaxed">Click the download button to save all your letter images. They will be downloaded as a ZIP file containing individual PNG images for each letter.</p>
                  <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Download Instructions */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6 relative inline-block">
                Download Instructions
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-white/50 to-transparent"></div>
              </h3>
              <div className="space-y-4 text-white/80 pl-4 border-l-2 border-white/10">
                <p className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  The download will create a ZIP file named after your text
                </p>
                <p className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  Each letter will be saved as a separate PNG image
                </p>
                <p className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  Images are high quality and can be used in any design software
                </p>
                <p className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  The ZIP file will contain all letters in the order they appear
                </p>
                <p className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  Each image is named with its letter and position (e.g., "A_1.png")
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-12 p-6 bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pro Tips
              </h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  Try different combinations of letters for unique results
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  Each letter will always be different, even if repeated
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  The generator works best with uppercase letters and numbers
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  Special characters and spaces are supported
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  You can download multiple times to get different variations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-16 relative">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Decorative line */}
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            {/* Copyright text */}
            <div className="text-white/60 text-center">
              <p className="text-sm tracking-wide">
                © {new Date().getFullYear()} Name Art Generator. All rights reserved.
              </p>
              <p className="text-sm mt-2 font-light">
                Created with <span className="text-red-400">❤️</span> by <span className="text-white/90 font-medium tracking-wide">Goutham Mathi</span>
              </p>
              <p className="text-xs mt-2 text-white/40">
                A creative project for generating unique ransom note style text art
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-6">
              <a href="https://github.com/gouthammathi" target="_blank" rel="noopener noreferrer" 
                className="text-white/40 hover:text-white/80 transition-colors duration-300 transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              {/* <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" 
                className="text-white/40 hover:text-white/80 transition-colors duration-300 transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a> */}
              <a href="https://linkedin.com/in/gouthammathi" target="_blank" rel="noopener noreferrer" 
                className="text-white/40 hover:text-white/80 transition-colors duration-300 transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            {/* Additional decorative line */}
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App