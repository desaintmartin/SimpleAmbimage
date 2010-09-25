/**
 * @author Cedric de Saint Martin 
 * This is a simple amiblight system, changing the background-color to color
 * calculated from an image.
 * Some code was borrowed from Sergey Chikuyonok (serge.che@gmail.com) and
 * (too) quickly adapted.
*/

simpleAmbimage = function() {
/**
 * Calculates middle color for pixel block
 * @param {CanvasPixelArray} data Canvas pixel data
 * @param {Number} from Start index of pixel data
 * @param {Number} to End index of pixel data
 * @return {Array} RGB-color
 */
function calcMidColor(data, from, to) {
  var result = [0, 0, 0];
  var total_pixels = (to - from) / 4;

  for (var i = from; i <= to; i += 4) {
    result[0] += data[i];
    result[1] += data[i + 1];
    result[2] += data[i + 2];
  }

  result[0] = Math.round(result[0] / total_pixels);
  result[1] = Math.round(result[1] / total_pixels);
  result[2] = Math.round(result[2] / total_pixels);

  return result;
}

/**
 * Returns array of midcolors for one of the side of buffer canvas
 * @param {String} side Canvas side where to take pixels from. 'left' or 'right'
 * @return {Array[]} Array of RGB colors
 */
function getMidColors(buffer, context, side) {
  var w = buffer.width,
      h = buffer.height,
      blocks = 5,
      block_width = 40,
      block_height = Math.ceil(h / blocks),
      pxl = block_width * block_height * 4,
      result = [],

      img_data = context.getImageData(side == 'right' ? w - block_width : 0, 0, block_width, h),
      total_pixels = img_data.data.length;


  for (var i = 0; i < blocks; i++) {
    var from = i * w * block_width;
    result.push( calcMidColor(img_data.data, i * pxl, Math.min((i + 1) * pxl, total_pixels - 1)) );
  }

  return result;
}

function getMedianColor(resultsLeft, resultsRight) {
  var medianColor = [0, 0, 0];
  for (var i = 0; i < resultsLeft.length; i++) {
    medianColor[0] += resultsLeft[i][0];
    medianColor[1] += resultsLeft[i][1];
    medianColor[2] += resultsLeft[i][2];
  }
  medianColor[0] = medianColor[0] / resultsLeft.length;
  medianColor[1] = medianColor[1] / resultsLeft.length;
  medianColor[2] = medianColor[2] / resultsLeft.length;

  for (var i = 0; i < resultsRight.length; i++) {
    medianColor[0] += resultsRight[i][0];
    medianColor[1] += resultsRight[i][1];
    medianColor[2] += resultsRight[i][2];
  }
  medianColor[0] = Math.floor(medianColor[0] / resultsRight.length);
  medianColor[1] = Math.floor(medianColor[1] / resultsRight.length);
  medianColor[2] = Math.floor(medianColor[2] / resultsRight.length);

  return medianColor;
}

function onImageReadyForDrawing(e) {
  var convas, context, image, imageDataData, results;
  image = e.target ? e.target : e;
  canvas = document.createElement('canvas');  
  canvas.setAttribute('id', 'canvas');
  context = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);
  image.parentNode.appendChild(image);
  resultsLeft = getMidColors(canvas, context, 'left');
  resultsRight = getMidColors(canvas, context, 'right');
  results = getMedianColor(resultsLeft, resultsRight);
  stringResults = 'rgb(' +  results[0] + ', ' +  results[1] + ', ' +  results[2]
                  + ')';
  if (window.jQuery) {
    if (!$.ui) {
      console.error('jQuery UI not present.')
    }
    //$(image.parentNode).animate({backgroundColor: stringResults}, 900, 'linear');
    $(image.parentNode.parentNode).animate({backgroundColor: stringResults}, 2000, 'linear');
  } else if (window.dojo) {
   /* dojo.animateProperty({ node: image.parentNode, duration: 900,
      properties: { backgroundColor:
        {start: image.parentNode.style.backgroundColor, end: stringResults}
      }
    }).play();*/
    dojo.animateProperty({ node: image.parentNode.parentNode, duration: 2000,
      properties: { backgroundColor:
        {start: 'rgb(0, 0, 0)', end: stringResults}
      }
    }).play();
  }
}

return {
  create: function(image) {
     onImageReadyForDrawing(image);
  }
}
}();
