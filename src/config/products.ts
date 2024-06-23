import { text } from "stream/consumers";

export const PRODUCTS_PRiCES = {
  material: {
    silicone: 0,
    polycarbonate: 5_00,
  },
  finish: {
    smooth: 0,
    textured: 5_00,
  },

} as const

export const BASE_PRICE = 20_00