import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Eve Planner database seeding...');

  // Clear existing records in correct order to avoid foreign key violations
  await prisma.adminAuditLog.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.vendorBookingRequest.deleteMany();
  await prisma.bookingService.deleteMany();
  await prisma.eventBooking.deleteMany();
  await prisma.packageAddon.deleteMany();
  await prisma.packageService.deleteMany();
  await prisma.eventPackage.deleteMany();
  await prisma.serviceAvailability.deleteMany();
  await prisma.serviceImage.deleteMany();
  await prisma.serviceListing.deleteMany();
  await prisma.vendorDocument.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing data cleared.');

  // Password hashes
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const vendorPasswordHash = await bcrypt.hash('Vendor@123', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@eveplanner.com',
      passwordHash: adminPasswordHash,
      fullName: 'Vikramaditya Roy (Admin)',
      role: 'ADMIN',
      phone: '+91 98100 11223',
    },
  });

  // 2. Create Sample Customer User
  const customerUser = await prisma.user.create({
    data: {
      email: 'riya.sharma@example.com',
      passwordHash: customerPasswordHash,
      fullName: 'Riya Sharma',
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      customerProfile: {
        create: {
          city: 'Delhi NCR',
          address: '42 DLF Cyber City, Phase 2, Gurugram',
          preferredBudget: 120000,
        },
      },
    },
  });

  // 3. Create Service Categories
  const categoriesData = [
    {
      name: 'Venues & Banquet Halls',
      slug: 'venues-banquets',
      description: 'Lush banquet halls, heritage lawns, boutique rooftops, and luxury celebration resorts.',
      icon: 'Building2',
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 1,
    },
    {
      name: 'Catering & Menus',
      slug: 'catering-menus',
      description: 'Gourmet live counters, multi-cuisine buffets, authentic regional delicacies, and artisan mocktails.',
      icon: 'Utensils',
      imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 2,
    },
    {
      name: 'Decorations & Florals',
      slug: 'decor-florals',
      description: 'Bespoke stage styling, fairy-light installations, exotic floral arches, and thematic table settings.',
      icon: 'Sparkles',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 3,
    },
    {
      name: 'Photography & Films',
      slug: 'photography-films',
      description: 'Cinematic candid storytelling, drone aerial videography, traditional portraits, and instant photo booths.',
      icon: 'Camera',
      imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 4,
    },
    {
      name: 'DJs, Sound & Entertainment',
      slug: 'entertainment-djs',
      description: 'Celebrity DJs, acoustic live bands, emcees, laser light setups, and mesmerizing percussionists.',
      icon: 'Music',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 5,
    },
    {
      name: 'Cakes & Gourmet Desserts',
      slug: 'cakes-desserts',
      description: 'Designer tiered cakes, dessert grazing tables, customized fondants, and handcrafted pastries.',
      icon: 'Cake',
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 6,
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.serviceCategory.create({ data: cat });
    categories[cat.slug] = createdCat;
  }

  // 4. Create Vendors (Approved and Pending)
  // Vendor 1: Royal Palace Venues (Approved)
  const vendor1User = await prisma.user.create({
    data: {
      email: 'royalpalace@eveplanner.com',
      passwordHash: vendorPasswordHash,
      fullName: 'Sanjay Mehra',
      role: 'VENDOR',
      phone: '+91 98111 22334',
    },
  });

  const vendor1 = await prisma.vendorProfile.create({
    data: {
      userId: vendor1User.id,
      businessName: 'The Royal Pavilion & Banquet',
      slug: 'the-royal-pavilion-banquet',
      categoryId: categories['venues-banquets'].id,
      description:
        'A premier celebration destination in Delhi NCR offering pillarless banquet halls, lush chandeliers, and landscaped outdoor terrace gardens.',
      address: 'Golf Course Extension Road, Sector 62',
      city: 'Delhi NCR',
      serviceArea: 'Delhi NCR, Gurugram, Faridabad',
      phone: '+91 98111 22334',
      email: 'contact@royalpavilion.in',
      websiteUrl: 'https://royalpavilion.example.com',
      status: 'APPROVED',
      rating: 4.9,
      reviewCount: 38,
      isVerified: true,
    },
  });

  // Vendor 2: Saffron Gourmet Catering (Approved)
  const vendor2User = await prisma.user.create({
    data: {
      email: 'saffronfeast@eveplanner.com',
      passwordHash: vendorPasswordHash,
      fullName: 'Chef Ananya Kapoor',
      role: 'VENDOR',
      phone: '+91 98222 33445',
    },
  });

  const vendor2 = await prisma.vendorProfile.create({
    data: {
      userId: vendor2User.id,
      businessName: 'Saffron Artisanal Catering Co.',
      slug: 'saffron-artisanal-catering-co',
      categoryId: categories['catering-menus'].id,
      description:
        'Michelin-trained culinary brigade curating live dim sum bars, royal Awadhi biryanis, wood-fired pizzas, and interactive dessert stations.',
      address: 'Indiranagar 100ft Road',
      city: 'Delhi NCR',
      serviceArea: 'Delhi NCR, Bengaluru, Mumbai',
      phone: '+91 98222 33445',
      email: 'feasts@saffroncatering.in',
      status: 'APPROVED',
      rating: 4.95,
      reviewCount: 52,
      isVerified: true,
    },
  });

  // Vendor 3: Aura Floral & Thematic Decor (Approved)
  const vendor3User = await prisma.user.create({
    data: {
      email: 'auradecor@eveplanner.com',
      passwordHash: vendorPasswordHash,
      fullName: 'Kabir Singhal',
      role: 'VENDOR',
      phone: '+91 98333 44556',
    },
  });

  const vendor3 = await prisma.vendorProfile.create({
    data: {
      userId: vendor3User.id,
      businessName: 'Aura Floral & Event Styling',
      slug: 'aura-floral-event-styling',
      categoryId: categories['decor-florals'].id,
      description:
        'Award-winning floral designers specializing in whimsical pastel birthdays, grand royal wedding stages, and enchanting candlelit proposals.',
      address: 'Bandra West, Hill Road',
      city: 'Delhi NCR',
      serviceArea: 'Delhi NCR, Mumbai',
      phone: '+91 98333 44556',
      email: 'hello@auradecor.in',
      status: 'APPROVED',
      rating: 4.88,
      reviewCount: 29,
      isVerified: true,
    },
  });

  // Vendor 4: Lumiere Cinema & Photos (Approved)
  const vendor4User = await prisma.user.create({
    data: {
      email: 'lumierefilms@eveplanner.com',
      passwordHash: vendorPasswordHash,
      fullName: 'Tanya Narang',
      role: 'VENDOR',
      phone: '+91 98444 55667',
    },
  });

  const vendor4 = await prisma.vendorProfile.create({
    data: {
      userId: vendor4User.id,
      businessName: 'Lumiere Celebration Films',
      slug: 'lumiere-celebration-films',
      categoryId: categories['photography-films'].id,
      description:
        'Cinematic storytellers preserving heartfelt laughter, happy tears, and unforgettable celebration highlights in 4K resolution.',
      address: 'Koramangala 4th Block',
      city: 'Delhi NCR',
      serviceArea: 'Delhi NCR, Bangalore, Mumbai',
      phone: '+91 98444 55667',
      email: 'tanya@lumierefilms.in',
      status: 'APPROVED',
      rating: 4.92,
      reviewCount: 44,
      isVerified: true,
    },
  });

  // Vendor 5: Pending Review Vendor (For testing Admin Verification flow!)
  const vendor5User = await prisma.user.create({
    data: {
      email: 'starlightevents@eveplanner.com',
      passwordHash: vendorPasswordHash,
      fullName: 'Deepak Verma',
      role: 'VENDOR',
      phone: '+91 98555 66778',
    },
  });

  await prisma.vendorProfile.create({
    data: {
      userId: vendor5User.id,
      businessName: 'Starlight Beats & Acoustic Live',
      slug: 'starlight-beats-acoustic-live',
      categoryId: categories['entertainment-djs'].id,
      description: 'High-energy DJ setups with state-of-the-art Line Array acoustics and intelligent moving-head lighting.',
      address: 'South Extension Part II',
      city: 'Delhi NCR',
      serviceArea: 'Delhi NCR',
      phone: '+91 98555 66778',
      email: 'deepak@starlightbeats.in',
      status: 'PENDING_REVIEW', // Pending admin review
      rating: 5.0,
      reviewCount: 0,
      isVerified: false,
    },
  });

  // 5. Create Service Listings
  // Listing 1: Royal Pavilion Grand Banquet
  const listing1 = await prisma.serviceListing.create({
    data: {
      vendorId: vendor1.id,
      categoryId: categories['venues-banquets'].id,
      title: 'Grand Crystal Ballroom & Terrace Garden',
      slug: 'grand-crystal-ballroom-terrace-garden',
      description:
        'Exquisite 6,500 sq.ft climate-controlled crystal ballroom with Italian marble flooring, 400-guest lawn, and private VIP bride & groom lounge.',
      startingPrice: 65000,
      priceUnit: 'per event slot',
      maxGuests: 350,
      city: 'Delhi NCR',
      location: 'Golf Course Extension Road, Gurugram',
      inclusions: JSON.stringify([
        'Full 6-hour ballroom & lawn access',
        'Bridal dressing room with en-suite bath',
        'Central air-conditioning & power back-up',
        'Valet parking service for 150 vehicles',
        'Round banquet tables with linen and Chiavari chairs',
      ]),
      exclusions: JSON.stringify([
        'Liquor licensing charges (if serving alcohol)',
        'Outside vendor generator surcharge',
      ]),
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 38,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
            altText: 'Crystal ballroom with warm elegant ceiling lights',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1545232979-fbf68fe9b1af?auto=format&fit=crop&w=1200&q=80',
            altText: 'Table setting detail in ballroom',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Listing 2: Saffron Gourmet 4-Course Celebration Buffet
  const listing2 = await prisma.serviceListing.create({
    data: {
      vendorId: vendor2.id,
      categoryId: categories['catering-menus'].id,
      title: 'Artisanal Celebration Banquet & Live Counters',
      slug: 'artisanal-celebration-banquet-live-counters',
      description:
        'A multi-course gourmet experience featuring 6 passed hors d’oeuvres, 2 live chef stations, 8 main courses, artisan breads, and 4 handcrafted desserts.',
      startingPrice: 1450,
      priceUnit: 'per plate',
      maxGuests: 500,
      city: 'Delhi NCR',
      location: 'Pan-Delhi NCR Service Hub',
      inclusions: JSON.stringify([
        '6 Welcome appetizers & bespoke mocktails',
        'Interactive live pasta & chaat station',
        'Complete bone-china cutlery, glassware & service staff',
        'Sanitized chafing dishes and warmers',
        'Complimentary designer fruit display',
      ]),
      exclusions: JSON.stringify([
        'Alcoholic beverage procurement',
        'Extra service staff beyond 6-hour block',
      ]),
      isActive: true,
      isFeatured: true,
      rating: 4.95,
      reviewCount: 52,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
            altText: 'Gourmet banquet dishes arranged aesthetically',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
            altText: 'Artisan cuisine spread',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Listing 3: Aura Luxe Floral & Ambient Lighting Setup
  const listing3 = await prisma.serviceListing.create({
    data: {
      vendorId: vendor3.id,
      categoryId: categories['decor-florals'].id,
      title: 'Dreamscape Floral Canopy & Fairy Ambient Decor',
      slug: 'dreamscape-floral-canopy-fairy-ambient-decor',
      description:
        'Transformative celebration styling featuring fresh seasonal Dutch roses, hydrangeas, baby’s breath arches, warm fairy light tunnels, and neon typography photo backdrops.',
      startingPrice: 32000,
      priceUnit: 'per celebration',
      maxGuests: 250,
      city: 'Delhi NCR',
      location: 'Delhi NCR & Greater Noida',
      inclusions: JSON.stringify([
        'Grand floral entrance archway',
        'Stage backdrop with custom neon signage',
        'Fairy light ceiling drape installations',
        '10 Floral table centerpieces with taper candles',
        'Setup completed 3 hours prior to event start',
      ]),
      exclusions: JSON.stringify([
        'Imported out-of-season orchid substitutions',
        'Venue structural rigging charges',
      ]),
      isActive: true,
      isFeatured: true,
      rating: 4.88,
      reviewCount: 29,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
            altText: 'Romantic floral backdrop with warm fairy lights',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  // Listing 4: Lumiere 4K Cinematic Photography & Teaser
  const listing4 = await prisma.serviceListing.create({
    data: {
      vendorId: vendor4.id,
      categoryId: categories['photography-films'].id,
      title: 'Cinematic Memories — 4K Candid Film & Photo Suite',
      slug: 'cinematic-memories-4k-candid-film-photo-suite',
      description:
        'Lead candid photo artist and dedicated cinematographer capturing unscripted moments, family laughter, and emotional highlights.',
      startingPrice: 28000,
      priceUnit: 'per event (up to 5 hours)',
      maxGuests: 200,
      city: 'Delhi NCR',
      location: 'Delhi NCR',
      inclusions: JSON.stringify([
        '1 Senior Candid Photographer + 1 Cinematographer',
        '300+ Color-graded high-resolution digital images',
        '2-3 minute cinematic music video teaser',
        'Private online cloud gallery for 1 year',
        'Delivery within 14 business days',
      ]),
      exclusions: JSON.stringify([
        'Physical printed luxury photo album (available as add-on)',
        'Drone aerial shoot permissions',
      ]),
      isActive: true,
      isFeatured: true,
      rating: 4.92,
      reviewCount: 44,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
            altText: 'Photographer capturing joyous couple celebration',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  // 6. Create Pre-Built Configurable Event Packages
  // Package 1: Birthday Standard Celebration
  const pkg1 = await prisma.eventPackage.create({
    data: {
      name: 'Birthday Standard Celebration',
      slug: 'birthday-standard-celebration',
      description:
        'An effortless, joyful birthday gathering for intimate family and friends, featuring curated balloon decor, cake cutting stage, and light catering.',
      eventType: 'Birthday',
      basePrice: 38000,
      guestCapacity: 30,
      durationHours: 4,
      inclusions: JSON.stringify([
        'Themed balloon arch & backdrop banner',
        '1 Senior photographer for 3 hours with 100 edited photos',
        'Delicious gourmet high-tea buffet with 4 savories and drinks',
        'Dedicated event coordinator on-site',
        'Bluetooth surround sound system',
      ]),
      exclusions: JSON.stringify([
        'Custom 3D designer tiered cake',
        'Hard alcohol bar service',
      ]),
      isPopular: true,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Custom 2kg Themed Fondant Cake', price: 3200, maxQuantity: 2 },
          { name: 'Magic Show / Balloon Twister (45 mins)', price: 4500, maxQuantity: 1 },
          { name: 'Instant Polaroids & Photo Guestbook', price: 2800, maxQuantity: 2 },
        ],
      },
    },
  });

  // Package 2: Birthday Premium Grand Gala
  const pkg2 = await prisma.eventPackage.create({
    data: {
      name: 'Birthday Premium Grand Gala',
      slug: 'birthday-premium-grand-gala',
      description:
        'An extravagant celebration package with live multi-cuisine dinner, LED photo-booth, DJ sound system, and floral stage decor.',
      eventType: 'Birthday',
      basePrice: 85000,
      guestCapacity: 75,
      durationHours: 5,
      inclusions: JSON.stringify([
        'Complete banquet space access for 5 hours',
        'Lavish 3-course dinner buffet for 75 guests',
        'Floral & neon light signature stage setup',
        'DJ setup with sound & moving head lights',
        'Candid photographer + 1-min Instagram reel editor',
        'Complimentary 3kg Belgian chocolate tiered cake',
      ]),
      exclusions: JSON.stringify([
        'Alcohol license fee and mixers',
        'Custom celebrity appearance',
      ]),
      isPopular: true,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: '360-Degree Video Spin Booth', price: 9500, maxQuantity: 1 },
          { name: 'Cold-Pyro Fireworks Display (4 units)', price: 4000, maxQuantity: 2 },
          { name: 'Bartender & Signature Mocktail Bar', price: 6500, maxQuantity: 1 },
        ],
      },
    },
  });

  // Package 3: Kids' Magical Birthday
  const pkg3 = await prisma.eventPackage.create({
    data: {
      name: "Kids' Enchanted Wonderland Birthday",
      slug: 'kids-enchanted-wonderland-birthday',
      description:
        'A whimsical adventure tailored for children featuring character cutouts, fun interactive games, face painting, and kid-friendly treats.',
      eventType: 'Birthday',
      basePrice: 42000,
      guestCapacity: 40,
      durationHours: 4,
      inclusions: JSON.stringify([
        'Thematic character stage (Superhero / Princess / Safari)',
        'Professional Emcee with kid party games & prizes',
        'Tattoo & Face Painting artist for 2 hours',
        'Kid-favorite buffet (mini burgers, pasta, cupcakes, juices)',
        'Goodie bags for 25 child guests',
      ]),
      exclusions: JSON.stringify(['Adult dining upgrade beyond tea/coffee']),
      isPopular: false,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Live Cotton Candy & Popcorn Cart', price: 3500, maxQuantity: 1 },
          { name: 'Inflatable Bouncy Castle (4 hrs)', price: 5500, maxQuantity: 1 },
        ],
      },
    },
  });

  // Package 4: Anniversary & Romantic Candlelight Dinner
  const pkg4 = await prisma.eventPackage.create({
    data: {
      name: 'Anniversary Romantic Candlelight Elegance',
      slug: 'anniversary-romantic-candlelight-elegance',
      description:
        'A magical evening designed to honor lifelong love. Features a private candlelit cabana, violinist accompaniment, and a chef-curated 5-course dinner.',
      eventType: 'Anniversary',
      basePrice: 28000,
      guestCapacity: 20,
      durationHours: 4,
      inclusions: JSON.stringify([
        'Private rooftop or garden cabana with red rose petals and candles',
        '5-Course gourmet dinner with non-alcoholic sparkling champagne',
        '1 Solo Violinist or Acoustic Guitarist for 60 minutes',
        '1-Hour private couple portrait photography session',
        'Personalized anniversary message plaque & flowers',
      ]),
      exclusions: JSON.stringify(['Transport limousine service']),
      isPopular: true,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Live Saxophone Performance Extension', price: 6000, maxQuantity: 1 },
          { name: 'Luxury Leather Album with 30 Couple Prints', price: 4500, maxQuantity: 1 },
        ],
      },
    },
  });

  // Package 5: Proposal & Engagement Celebration
  const pkg5 = await prisma.eventPackage.create({
    data: {
      name: 'Unforgettable Dream Proposal & Engagement',
      slug: 'unforgettable-dream-proposal-engagement',
      description:
        'Create a picture-perfect "Yes!" moment with giant Marry Me marquee letters, rose petal pathways, fireworks, and secret paparazzi photography.',
      eventType: 'Proposal',
      basePrice: 48000,
      guestCapacity: 25,
      durationHours: 3,
      inclusions: JSON.stringify([
        '4ft illuminated "MARRY ME" LED marquee letters',
        'Red carpet walkway lined with 50 glass lanterns and petals',
        'Hidden candid paparazzi photographer capturing the proposal',
        'Champagne toast & imported Belgian strawberry dessert',
        'Hand-tied bouquet of 50 long-stem red roses',
      ]),
      exclusions: JSON.stringify(['Engagement ring and jewelry insurance']),
      isPopular: true,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Cold-Spark Fountain Pyro during Ring reveal', price: 5000, maxQuantity: 1 },
          { name: 'Drone 4K 60fps Aerial Video highlight', price: 7500, maxQuantity: 1 },
        ],
      },
    },
  });

  // Package 6: Baby Shower Celebration
  const pkg6 = await prisma.eventPackage.create({
    data: {
      name: 'Blissful New Beginnings Baby Shower',
      slug: 'blissful-new-beginnings-baby-shower',
      description:
        'A warm, heartwarming celebration for parents-to-be with pastel balloon clouds, floral mom-to-be throne, high-tea pastries, and fun shower games.',
      eventType: 'Baby Shower',
      basePrice: 35000,
      guestCapacity: 35,
      durationHours: 4,
      inclusions: JSON.stringify([
        'Pastel organic balloon garland & "Oh Baby" gold hoop arch',
        'Floral peacock chair / throne for the mom-to-be',
        'High-tea buffet with savory quiches, sandwiches & mini desserts',
        'Shower games coordinator with printed game cards',
        'Candid event photo coverage for 3 hours',
      ]),
      exclusions: JSON.stringify(['Special gender-reveal smoke bombs']),
      isPopular: false,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Custom Pastel 2kg Drip Cake', price: 2800, maxQuantity: 1 },
          { name: 'Customized Baby Shower Keepsake Favors (35 pcs)', price: 4200, maxQuantity: 2 },
        ],
      },
    },
  });

  // Package 7: Royal Wedding Celebration
  const pkg7 = await prisma.eventPackage.create({
    data: {
      name: 'Royal Heritage Wedding Celebration',
      slug: 'royal-heritage-wedding-celebration',
      description:
        'The definitive grand celebration for couples seeking luxury and seamless multi-vendor synergy. Full ballroom, lavish 7-course buffet, and royal floral mandap.',
      eventType: 'Wedding',
      basePrice: 225000,
      guestCapacity: 250,
      durationHours: 8,
      inclusions: JSON.stringify([
        'Full crystal ballroom & outdoor garden access for 8 hours',
        'Lavish 7-course royal Awadhi & continental dinner for 250 guests',
        'Grand floral mandap & stage with fresh imported flowers',
        '2 Candid Photographers + 2 Cinematographers with drone coverage',
        'Full sound & lighting setup with DJ and live Dhol players',
        'Dedicated senior wedding coordinator team of 4 coordinators',
      ]),
      exclusions: JSON.stringify([
        'Outstation bridal makeup artist airfare',
        'Government excise license for bar',
      ]),
      isPopular: true,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Luxury Vintage Bridal Entry Car', price: 18000, maxQuantity: 1 },
          { name: 'Traditional Shehnai & Sitar Welcome Troupe', price: 12000, maxQuantity: 1 },
          { name: 'Full Drone 4K Livestream for remote family', price: 15000, maxQuantity: 1 },
        ],
      },
    },
  });

  // Package 8: Executive Corporate Gala
  const pkg8 = await prisma.eventPackage.create({
    data: {
      name: 'Executive Corporate Annual Gala',
      slug: 'executive-corporate-annual-gala',
      description:
        'Sophisticated corporate celebration for milestone anniversaries, awards nights, and annual team conferences. Premium AV, podium, and networking dinner.',
      eventType: 'Corporate',
      basePrice: 110000,
      guestCapacity: 120,
      durationHours: 6,
      inclusions: JSON.stringify([
        'State-of-the-art P3 LED video wall (16x9 ft) and podium mics',
        'Cocktail networking snacks + executive buffet dinner',
        'Professional corporate emcee and background music sound engineer',
        'Event registration desk management and digital badge scanners',
        'High-resolution corporate photo album and recap video',
      ]),
      exclusions: JSON.stringify(['Custom corporate branded mementos/trophies']),
      isPopular: false,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      addons: {
        create: [
          { name: 'Live Stand-up Comedian / Keynote Speaker Set', price: 25000, maxQuantity: 1 },
          { name: 'Branded Photo Booth with Instant Digital Prints', price: 9000, maxQuantity: 1 },
        ],
      },
    },
  });

  // Link Package Services
  await prisma.packageService.createMany({
    data: [
      { packageId: pkg1.id, listingId: listing3.id, isIncluded: true },
      { packageId: pkg1.id, listingId: listing4.id, isIncluded: true },
      { packageId: pkg2.id, listingId: listing1.id, isIncluded: true },
      { packageId: pkg2.id, listingId: listing2.id, isIncluded: true },
      { packageId: pkg2.id, listingId: listing3.id, isIncluded: true },
      { packageId: pkg2.id, listingId: listing4.id, isIncluded: true },
      { packageId: pkg7.id, listingId: listing1.id, isIncluded: true },
      { packageId: pkg7.id, listingId: listing2.id, isIncluded: true },
      { packageId: pkg7.id, listingId: listing3.id, isIncluded: true },
      { packageId: pkg7.id, listingId: listing4.id, isIncluded: true },
    ],
  });

  // 7. Create Sample Review
  await prisma.review.create({
    data: {
      customerId: customerUser.id,
      vendorId: vendor1.id,
      listingId: listing1.id,
      rating: 5,
      comment:
        'The Royal Pavilion exceeded every expectation for my sister’s engagement! The staff handled 200 guests effortlessly and the decor was breathtaking.',
      vendorReply: 'Thank you Riya! It was a true pleasure hosting your family celebration.',
      isPublished: true,
    },
  });

  // 8. Create Sample Event Booking for Riya
  const sampleBooking = await prisma.eventBooking.create({
    data: {
      bookingNumber: 'EVE-2025-8821',
      customerId: customerUser.id,
      packageId: pkg1.id,
      eventType: 'Birthday',
      eventDate: new Date('2025-11-15T18:30:00Z'),
      startTime: '18:30',
      endTime: '22:30',
      location: 'DLF Phase 2 Clubhouse, Gurugram',
      city: 'Delhi NCR',
      guestCount: 30,
      specialRequirements: 'Please ensure non-spicy options for toddlers.',
      baseAmount: 38000,
      addonsAmount: 3200,
      taxAmount: 2060,
      totalAmount: 43260,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      selectedAddonsJson: JSON.stringify([
        { name: 'Custom 2kg Themed Fondant Cake', price: 3200, quantity: 1, subtotal: 3200 },
      ]),
    },
  });

  await prisma.bookingService.create({
    data: {
      bookingId: sampleBooking.id,
      listingId: listing3.id,
      vendorId: vendor3.id,
      price: 38000,
      status: 'CONFIRMED',
    },
  });

  await prisma.vendorBookingRequest.create({
    data: {
      bookingId: sampleBooking.id,
      vendorId: vendor3.id,
      listingId: listing3.id,
      status: 'ACCEPTED',
      notes: 'Confirmed for Nov 15th evening decor.',
      respondedAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: sampleBooking.id,
      transactionId: 'TXN-RAZOR-991283',
      gateway: 'RAZORPAY',
      amount: 43260,
      currency: 'INR',
      status: 'SUCCESS',
      paymentMethod: 'UPI',
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('-----------------------------------------');
  console.log('🔑 Seeded Credentials for Testing:');
  console.log('👤 Admin:    admin@eveplanner.com / Admin@123');
  console.log('🏪 Vendor:   royalpalace@eveplanner.com / Vendor@123');
  console.log('🎉 Customer: riya.sharma@example.com / Customer@123');
  console.log('-----------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
