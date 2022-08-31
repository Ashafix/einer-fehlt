//    var player = document.getElementById('img')
  //  const webcam = await tf.data.webcam(player, {
  //  resizeWidth: 640,
  //  resizeHeight: 640,
  //})
  // Capture an image tensor at a specific point in time.
  //const img = await webcam.capture()
  //const batch = img.div(255.0).expandDims(0)
  //*
  // const prediction = await model.executeAsync(batch)
  //   prediction.forEach(t => t.print()) // log out the data of all tensors
  // const data = []
  // for (let i = 0 i < prediction.length i++)
  //   data.push(prediction[i].dataSync())
  // console.log(data)
  //
  //   const predictions = []
  //   // setVideoHeight(webcamRef.current.video.videoHeight)
  //   // setVideoWidth(webcamRef.current.video.videoWidth)
  //   var cnvs = document.getElementById('myCanvas')
  //   cnvs.width =  webcamRef.current.video.videoWidth
  //   cnvs.height = webcamRef.current.video.videoHeight
  //   // cnvs.style.position = 'absolute'
  //
  //   var ctx = cnvs.getContext('2d')
  //   ctx.clearRect(
  //     0,
  //     0,
  //     webcamRef.current.video.videoWidth,
  //     webcamRef.current.video.videoHeight
  //   )
  //   console.log(predictions)
  //   if (predictions.length > 0) {
  //     // setPredictionData(predictions)
  //     console.log(predictions)
  //     for (let n = 0 n < predictions.length n++) {
  //       // Check scores
  //       console.log(n)
  //       if (predictions[n].score > 0.8) {
  //         let bboxLeft = predictions[n].bbox[0]
  //         let bboxTop = predictions[n].bbox[1]
  //         let bboxWidth = predictions[n].bbox[2]
  //         let bboxHeight = predictions[n].bbox[3] // - bboxTop
  //
  //         ctx.beginPath()
  //         ctx.font = '28px Arial'
  //         ctx.fillStyle = 'red'
  //
  //         ctx.fillText(
  //           predictions[n].class +
  //             ': ' +
  //             Math.round(parseFloat(predictions[n].score) * 100) +
  //             '%',
  //           bboxLeft,
  //           bboxTop
  //         )
  //
  //         ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight)
  //         ctx.strokeStyle = '#FF0000'
  //
  //         ctx.lineWidth = 3
  //         ctx.stroke()
  //
  //         console.log('detected')
  //       }
  //     }
  //   }
  //   //
    //setTimeout(() => predictionFunction(), 500)
  }


  // useEffect(() => {
  //   //prevent initial triggering
  //   if (mounted.current) {
  //     predictionFunction()

  //   } else {
  //     mounted.current = true
  //   }
  // }, [start])
