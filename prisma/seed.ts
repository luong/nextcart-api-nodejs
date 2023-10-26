import { CouponScope, CouponStatus, CouponValueType, PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const today = new Date();

  // Customers
  await prisma.customer.createMany({
    data: [
      { id: 'c4a87428-3021-708b-d9b6-f70db430b78b', email: 'luongfox@gmail.com', firstName: 'Luong', lastName: 'Le', createdAt: today, updatedAt: today }
    ]
  });

  // Brands
  await prisma.brand.createMany({
    data: [
      { name: 'Penguin', createdAt: today, updatedAt: today },
      { name: 'Millan', createdAt: today, updatedAt: today }
    ]
  });

  // Products
  await prisma.product.createMany({
    data: [
      { name: 'Ocean Blue Shirt', description: 'Ocean blue cotton shirt with a narrow collar and buttons down the front and long sleeves. Comfortable fit and tiled kalidoscope patterns.', price: 50, quantity: 100, brandId: 1, image: 'young-man-in-bright-fashion_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Classic Varsity Top', description: 'Womens casual varsity top, This grey and black buttoned top is a sport-inspired piece complete with an embroidered letter.', price: 100, quantity: 100, brandId: 2, image: 'casual-fashion-woman_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Yellow Wool Jumper', description: 'Knitted jumper in a soft wool blend with low dropped shoulders and wide sleeves and think cuffs. Perfect for keeping warm during Fall.', price: 60, quantity: 100, brandId: 1, image: 'autumn-photographer-taking-picture_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Floral White Top', description: 'Stylish sleeveless white top with a floral pattern.	', price: 60, quantity: 100, brandId: 1, image: 'city-woman-fashion_925x@2x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Striped Silk Blouse', description: 'Ultra-stylish black and red striped silk blouse with buckle collar and matching button pants.', price: 66, quantity: 100, brandId: 2, image: 'striped-blouse-fashion_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Classic Leather Jacket', description: 'Womans zipped leather jacket. Adjustable belt for a comfortable fit, complete with shoulder pads and front zip pocket.', price: 60, quantity: 100, brandId: 2, image: 'leather-jacket-and-tea_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Dark Denim Top', description: 'Classic dark denim top with chest pockets, long sleeves with buttoned cuffs, and a ripped hem effect.', price: 90, quantity: 100, brandId: 1, image: 'young-female-models-denim_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Navy Sports Jacket', description: 'Long-sleeved navy waterproof jacket in thin, polyester fabric with a soft mesh inside. The durable water-repellent finish means you\'ll be kept comfortable and protected when out in all weathers.', price: 60, quantity: 100, brandId: 1, image: 'mens-fall-fashion-jacket_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Soft Winter Jacket', description: 'Thick black winter jacket, with soft fleece lining. Perfect for those cold weather days.', price: 70, quantity: 100, brandId: 1, image: 'smiling-woman-on-snowy-afternoon_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Black Leather Bag', description: 'Womens black leather bag, with ample space. Can be worn over the shoulder, or remove straps to carry in your hand.', price: 80, quantity: 100, brandId: 2, image: 'black-bag-over-the-shoulder_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Zipped Jacket', description: 'Dark navy and light blue men\'s zipped waterproof jacket with an outer zipped chestpocket for easy storeage.', price: 80, quantity: 100, brandId: 2, image: 'menswear-blue-zip-up-jacket_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Silk Summer Top', description: 'Silk womens top with short sleeves and number pattern.', price: 60, quantity: 100, brandId: 1, image: 'young-hip-woman-at-carnival_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Long Sleeve Cotton Top', description: 'Black cotton womens top, with long sleeves, no collar and a thick hem.', price: 60, quantity: 100, brandId: 1, image: 'woman-outside-brownstone_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Chequered Red Shirt', description: 'Classic mens plaid flannel shirt with long sleeves, in chequered style, with two chest pockets.', price: 60, quantity: 100, brandId: 1, image: 'red-plaid-shirt_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'White Cotton Shirt', description: 'Plain white cotton long sleeved shirt with loose collar. Small buttons and front pocket.', price: 65, quantity: 100, brandId: 2, image: 'smiling-woman-poses_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Olive Green Jacket', description: 'Loose fitting olive green jacket with buttons and large pockets. Multicoloured pattern on the front of the shoulders.', price: 90, quantity: 100, brandId: 1, image: 'urban-fashion_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Blue Silk Tuxedo', description: 'Blue silk tuxedo with marbled aquatic pattern and dark lining. Sleeves are complete with rounded hem and black buttons.', price: 70, quantity: 100, brandId: 1, image: 'man-adjusts-blue-tuxedo-bowtie_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Red Sports Tee', description: 'Women\'s red sporty t-shirt with colorful details on the sleeves and a small white pocket.', price: 66, quantity: 100, brandId: 2, image: 'womens-red-t-shirt_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'Striped Skirt and Top', description: 'Black cotton top with matching striped skirt.', price: 70, quantity: 100, brandId: 2, image: 'woman-in-the-city_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today },
      { name: 'LED High Tops', description: 'Black high top shoes with green LED lights in the sole, tied up with laces and a buckle.', price: 160, quantity: 100, brandId: 1, image: 'putting-on-your-shoes_925x.jpg', status: ProductStatus.Active, createdAt: today, updatedAt: today }
    ]
  });

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { name: 'HAPPY20', value: 20, valueType: CouponValueType.Fixed, scope: CouponScope.Subtotal, status: CouponStatus.Active, createdAt: today, updatedAt: today },
      { name: 'HAPPY10P', value: 0.1, valueType: CouponValueType.Percentage, scope: CouponScope.Subtotal, status: CouponStatus.Active, createdAt: today, updatedAt: today }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect();
    process.exit(1);
  });