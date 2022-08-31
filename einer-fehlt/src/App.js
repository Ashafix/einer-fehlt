import React, { useEffect, useState, useRef, useMemo } from 'react'
import './App.css'
import * as tf from '@tensorflow/tfjs'

import Webcam from 'react-webcam'
import MagicDropzone from 'react-magic-dropzone'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

import { URL_MODEL } from './config.js'
import { names, videoConstraints } from './consts.js'
import { Answer } from './Answer.js'

function App() {

  const webcamRef = useRef(null)
  const videoWidth = 640
  const videoHeight = 640
  const [gameIsReady, setGameIsReady] = useState(false)
  const [preview, setPreview] = useState()
  const [isMissing, setIsMissing] = useState([undefined])
  const [model, setModel] = useState()
  const timeout = useRef()

  const timeToStart = 5

  const Count = () => {
    const [count, setCount] = useState(timeToStart)

    const size = 0.8 * Math.min(window.screen.width, window.screen.height)
    return (
      <div style={{width: size, margin: '0 auto', marginTop: '100px'}}>

        <CountdownCircleTimer
          size={size}
          isPlaying={!gameIsReady}
          duration={count}
          initialRemainingTime={timeToStart}
          isSmoothColorTransition={true}
          colors={['#004777', '#F7B801', '#A30000', '#A30000']}
          colorsTime={[timeToStart, 2/3 * timeToStart, 0.5 * timeToStart, 0]}
          onUpdate={(remainingTime) => {
          }}
          onComplete={() => {
            setGameIsReady(true)
            predictionFunction({target: {name: 'foo'}})
          }}
        >
          {({ remainingTime }) => <h1 style={{fontSize: '196px'}}>{remainingTime}</h1>}
        </CountdownCircleTimer>
        <hr />

      </div>
    )
  }

  async function loadModel() {
    try {
      //const model = await cocoSsd.load()
      const model = await tf.loadGraphModel(URL_MODEL)
      setModel(model)
    } catch (err) {
      console.log(err)
      console.log('failed load model')
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel()
    })
  }, [])
  const renderWebcam = useMemo(() => (
    <div style={{height: '640px', width: '640px'}}>
    <Webcam
      audio={false}
      id='webcam'
      ref={webcamRef}
      screenshotQuality={1}
      screenshotFormat='image/jpeg'
      videoConstraints={videoConstraints}
      hidden={true}
    />
    </div>
  ), [webcamRef])

  const cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight

    // canvas.width = image.width
    // canvas.height = image.height

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
    const newWidth = Math.round(naturalWidth * ratio)
    const newHeight = Math.round(naturalHeight * ratio)
    ctx.drawImage(
      image,
      0,
      0,
      naturalWidth,
      naturalHeight,
      (canvas.width - newWidth) / 2,
      (canvas.height - newHeight) / 2,
      newWidth,
      newHeight,
    )
  }

  async function predictionFunction(e) {

    const fromDropzone = e.target.className === 'Dropzone-img'

    if (!fromDropzone) {
      timeout.current = setTimeout(() => predictionFunction(e), 500);
    }

    const c = document.getElementById('canvas')
    const ctx = c.getContext('2d')

    let batch
    if (fromDropzone) {
      //cropToCanvas(e.target, c, ctx)
      batch = tf.tidy(() => {
        return tf.image.resizeBilinear(tf.browser.fromPixels(c), [640, 640])
          .div(255.0).expandDims(0)
      })

    } else {
      var player = document.getElementById('webcam')
      const webcam = await tf.data.webcam(player, {
        resizeWidth: 640,
        resizeHeight: 640,
      })
      const img = await webcam.capture()
      const imgNormalized = img.div(255.0)
      await tf.browser.toPixels(imgNormalized, c);
      batch = imgNormalized.expandDims(0)
    }

    model.executeAsync(batch).then(res => {
      // Font options.
      const font = '16px sans-serif'
      ctx.font = font
      ctx.textBaseline = 'top'

      const [boxes, scores, classes, validDetections] = res
      const boxes_data = boxes.dataSync()
      const scores_data = scores.dataSync()
      const classes_data = classes.dataSync()
      const valid_detections_data = validDetections.dataSync()[0]
      tf.dispose(res)

      let missingClasses = []
      names.forEach((className) => {
        missingClasses.push(className)
      })
      var i
      let validDetection = false
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4)
        x1 *= c.width
        x2 *= c.width
        y1 *= c.height
        y2 *= c.height
        const width = x2 - x1
        const height = y2 - y1
        const predictedClass = names[classes_data[i]]
        const score = scores_data[i].toFixed(2)

        // Draw the bounding box.
        ctx.strokeStyle = '#00FFFF'
        ctx.lineWidth = 4
        ctx.strokeRect(x1, y1, width, height)

        // Draw the label background.
        ctx.fillStyle = '#00FFFF'
        const textWidth = ctx.measureText(predictedClass + ':' + score).width
        const textHeight = parseInt(font, 10) // base 10
        ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4)

      }
      for (i = 0; i < valid_detections_data; ++i) {

        let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4)
        x1 *= c.width
        y1 *= c.height
        const className = names[classes_data[i]]
        const score = scores_data[i].toFixed(2)
        const index = missingClasses.indexOf(className)
        if (className === 'karte') { validDetection = true }
        if (index > -1) {
          missingClasses.splice(index, 1)
        }
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = '#000000'
        ctx.fillText(className + ':' + score, x1, y1)
      }
      if (validDetection && missingClasses.length === 1) {
        setIsMissing(missingClasses)
        clearTimeout(timeout.current)
      }

    })
  }

  const onDrop = (accepted, rejected, links) => {
    setPreview(accepted[0].preview || links[0] )
  }

  const hideModal = () => {
    setIsMissing([undefined])
    setGameIsReady(false)
    setPreview(undefined)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        marginTop: -8
      }}
    >
      { !gameIsReady ?
      <Count />
:
<></>
}
      <div style={{ position: 'absolute', top: '100px' }} hidden={!gameIsReady}>
        <table style={{width: '100vw'}}>
          <tbody>
            <tr>
              <td style={{width: '100%'}}>
                <canvas id='canvas' width='640' height='640'
style={{height: '640px', width: '640px'}}
                />
              </td>
              <td>
              {renderWebcam}
              </td>
              <td hidden={true}>
                <MagicDropzone
                  className='Dropzone'
                  accept='image/jpeg, image/png, .jpg, .jpeg, .png'
                  multiple={false}
                  onDrop={onDrop}
                >
                  {preview ? (
                    <img
                      alt='upload preview'
                      onLoad={predictionFunction}
                      className='Dropzone-img'
                      src={preview}
                      hidden={true}
                    />
                  ) : (
                    'Choose or drop a file.'
                  )}
                </MagicDropzone>
              </td>
            </tr>
          </tbody>
        </table>

        <Answer message={isMissing[0]} isOpen={isMissing[0] !== undefined}
          callback={hideModal}
        />
      </div>
    </div>
  )
}

export default App
