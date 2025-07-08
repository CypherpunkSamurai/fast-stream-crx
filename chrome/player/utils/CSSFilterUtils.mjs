import {SVGDaltonizer} from '../modules/SVGDaltonizer.mjs';
import {DaltonizerTypes} from '../options/defaults/DaltonizerTypes.mjs';

const DaltonizerTypeMap = new Map();
DaltonizerTypeMap.set(DaltonizerTypes.NONE, -1);
DaltonizerTypeMap.set(DaltonizerTypes.PROTANOMALY, 0);
DaltonizerTypeMap.set(DaltonizerTypes.DEUTERANOMALY, 1);
DaltonizerTypeMap.set(DaltonizerTypes.TRITANOMALY, 2);

export class CSSFilterUtils {
  static getFilterString(options) {
    const filters = [];
    if (!options.disableVisualFilters) {
      if (options.videoDaltonizerType !== DaltonizerTypes.NONE && options.videoDaltonizerStrength > 0) {
        filters.push(`url(#daltonizer-${options.videoDaltonizerType}-${options.videoDaltonizerStrength})`);
      }

      if (options.videoBrightness !== 1) {
        filters.push(`brightness(${options.videoBrightness})`);
      }

      if (options.videoContrast !== 1) {
        filters.push(`contrast(${options.videoContrast})`);
      }

      if (options.videoSaturation !== 1) {
        filters.push(`saturate(${options.videoSaturation})`);
      }

      if (options.videoGrayscale !== 0) {
        filters.push(`grayscale(${options.videoGrayscale})`);
      }

      if (options.videoSepia !== 0) {
        filters.push(`sepia(${options.videoSepia})`);
      }

      if (options.videoInvert !== 0) {
        filters.push(`invert(${options.videoInvert})`);
      }

      if (options.videoHueRotate !== 0) {
        filters.push(`hue-rotate(${options.videoHueRotate}deg)`);
      }

      if (options.videoSharpness !== 0) {
        // Pass the sharpness value to the filter
        CSSFilterUtils.addSharpnessSVGFilter(options.videoSharpness);
        filters.push(`url(#sharpness-filter)`);
      } else {
        // If sharpness is 0, remove the filter if it exists
        CSSFilterUtils.removeSharpnessSVGFilter();
      }
    } else {
      // If visual filters are disabled, remove the sharpness filter
      CSSFilterUtils.removeSharpnessSVGFilter();
    }

    return filters.join(' ');
  }

  static addSharpnessSVGFilter(sharpnessValue) {
    let svgFilter = document.getElementById('sharpness-svg-filter');
    if (!svgFilter) {
      svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgFilter.setAttribute('id', 'sharpness-svg-filter');
      svgFilter.setAttribute('width', '0');
      svgFilter.setAttribute('height', '0');
      document.body.appendChild(svgFilter);
    }

    // Unsharp Mask filter
    // The amount of sharpening is controlled by the 'amount' attribute of feUnsharpMask.
    // A higher value means more sharpening.
    // The radius determines the size of the blur applied to the mask.
    // The threshold determines the minimum difference in pixel values to be sharpened.
    // These values can be tuned for optimal results.
    const amount = sharpnessValue * 0.01; // Scale sharpnessValue to a suitable range for 'amount'
    const radius = 1.0; // Can be adjusted
    const threshold = 0; // Can be adjusted

    svgFilter.innerHTML = `
      <filter id="sharpness-filter">
        <feGaussianBlur in="SourceAlpha" stdDeviation="${radius}" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k1="0" k2="1" k3="${amount}" k4="0" result="unsharp" />
        <feComposite in="SourceGraphic" in2="unsharp" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
      </filter>
    `;
  }

  static removeSharpnessSVGFilter() {
    const svgFilter = document.getElementById('sharpness-svg-filter');
    if (svgFilter) {
      svgFilter.remove();
    }
  }

  static makeLMSDaltonizerFilter(type, strength) {
    return SVGDaltonizer.makeLMSDaltonizerFilter(DaltonizerTypeMap.get(type), strength, true);
  }

  static getTransformString(options) {
    const transforms = [];

    if (options.videoFlip !== 0) {
      transforms.push(`scaleX(${options.videoFlip % 2 === 0 ? options.videoZoom : -options.videoZoom}) scaleY(${options.videoFlip > 1 ? -options.videoZoom : options.videoZoom})`);
    } else if (options.videoZoom !== 1) {
      transforms.push(`scale(${options.videoZoom})`);
    }

    if (options.videoRotate !== 0) {
      transforms.push(`rotate(${options.videoRotate * 90}deg)`);
    }

    return transforms.join(' ');
  }
}
