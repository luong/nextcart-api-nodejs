import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
  .$extends({
    result: {
      product: {
        imageUrl: {
          needs: { image: true },
          compute(product) {
            return `${process.env.BASE_IMAGE_URL}/product/${product.image}`
          },
        },
      },
    },
  });

export default prisma;