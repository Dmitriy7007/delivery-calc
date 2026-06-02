import React from 'react'
import ReactDom from 'react-dom'
import type { YMapLocationRequest } from 'ymaps3'

await ymaps3.ready;

const [ymaps3React] = await Promise.all([
  ymaps3.import('@yandex/ymaps3-reactify'),
  ymaps3.ready,
])

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom)
export const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapFeature,
  YMapMarker,
  YMapListener,
  YMapControls,
  YMapControlButton,
} = reactify.module(ymaps3)

export type { YMapLocationRequest }
