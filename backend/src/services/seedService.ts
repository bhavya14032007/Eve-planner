import prisma from '../config/db';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  console.log('🌱 Checking & seeding database with default celebration packages and vendors...');

  // Password hashes
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const vendorPasswordHash = await bcrypt.hash('Vendor@123', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  // 1. Create or Find Admin User
  let adminUser = await prisma.user.findUnique({ where: { email: 'admin@eveplanner.com' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@eveplanner.com',
        passwordHash: adminPasswordHash,
        fullName: 'Vikramaditya Roy (Admin)',
        role: 'ADMIN',
        phone: '+91 98100 11223',
      },
    });
  }

  // 2. Create or Find Sample Customer User
  let customerUser = await prisma.user.findUnique({ where: { email: 'riya.sharma@example.com' } });
  if (!customerUser) {
    customerUser = await prisma.user.create({
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
  }

  // 3. Service Categories
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
    let existing = await prisma.serviceCategory.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      existing = await prisma.serviceCategory.create({ data: cat });
    }
    categories[cat.slug] = existing;
  }

  // 4. Vendors
  const vendorConfigs = [
    {
      email: 'royalpalace@eveplanner.com',
      name: 'Sanjay Mehra',
      businessName: 'The Royal Pavilion & Banquet',
      slug: 'the-royal-pavilion-banquet',
      catSlug: 'venues-banquets',
      description: 'A premier celebration destination in Delhi NCR offering pillarless banquet halls and gardens.',
      address: 'Golf Course Extension Road, Sector 62',
      phone: '+91 98111 22334',
    },
    {
      email: 'saffronfeast@eveplanner.com',
      name: 'Chef Ananya Kapoor',
      businessName: 'Saffron Artisanal Catering Co.',
      slug: 'saffron-artisanal-catering-co',
      catSlug: 'catering-menus',
      description: 'Michelin-trained culinary brigade curating live dim sum bars and royal Awadhi feasts.',
      address: 'Indiranagar 100ft Road',
      phone: '+91 98222 33445',
    },
    {
      email: 'auradecor@eveplanner.com',
      name: 'Kabir Singhal',
      businessName: 'Aura Floral & Event Styling',
      slug: 'aura-floral-event-styling',
      catSlug: 'decor-florals',
      description: 'Award-winning floral designers specializing in whimsical pastel birthdays and stages.',
      address: 'Bandra West, Hill Road',
      phone: '+91 98333 44556',
    },
    {
      email: 'lumierefilms@eveplanner.com',
      name: 'Tanya Narang',
      businessName: 'Lumiere Celebration Films',
      slug: 'lumiere-celebration-films',
      catSlug: 'photography-films',
      description: 'Cinematic storytellers preserving heartfelt laughter and 4K memories.',
      address: 'Koramangala 4th Block',
      phone: '+91 98444 55667',
    },
  ];

  const vendors: Record<string, any> = {};
  for (const v of vendorConfigs) {
    let user = await prisma.user.findUnique({ where: { email: v.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: v.email,
          passwordHash: vendorPasswordHash,
          fullName: v.name,
          role: 'VENDOR',
          phone: v.phone,
        },
      });
    }

    let profile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: v.businessName,
          slug: v.slug,
          categoryId: categories[v.catSlug].id,
          description: v.description,
          address: v.address,
          city: 'Delhi NCR',
          serviceArea: 'Delhi NCR, Bengaluru, Mumbai',
          phone: v.phone,
          email: v.email,
          status: 'APPROVED',
          rating: 4.9,
          reviewCount: 35,
          isVerified: true,
        },
      });
    }
    vendors[v.slug] = profile;
  }

  // 5. Pre-Built Configurable Event Packages
  const packagesData = [
    {
      name: 'Birthday Standard Celebration',
      slug: 'birthday-standard-celebration',
      description: 'An effortless, joyful birthday gathering for intimate family and friends, featuring curated balloon decor, cake cutting stage, and light catering.',
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
      imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Custom 2kg Themed Fondant Cake', price: 3200, maxQuantity: 2 },
        { name: 'Magic Show / Balloon Twister (45 mins)', price: 4500, maxQuantity: 1 },
        { name: 'Instant Polaroids & Photo Guestbook', price: 2800, maxQuantity: 2 },
      ],
    },
    {
      name: 'Birthday Premium Grand Gala',
      slug: 'birthday-premium-grand-gala',
      description: 'An extravagant celebration package with live multi-cuisine dinner, LED photo-booth, DJ sound system, and floral stage decor.',
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
      exclusions: JSON.stringify(['Alcohol license fee and mixers']),
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: '360-Degree Video Spin Booth', price: 9500, maxQuantity: 1 },
        { name: 'Cold-Pyro Fireworks Display (4 units)', price: 4000, maxQuantity: 2 },
        { name: 'Bartender & Signature Mocktail Bar', price: 6500, maxQuantity: 1 },
      ],
    },
    {
      name: "Kids' Enchanted Wonderland Birthday",
      slug: 'kids-enchanted-wonderland-birthday',
      description: 'A whimsical adventure tailored for children featuring character cutouts, fun interactive games, face painting, and kid-friendly treats.',
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
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Live Cotton Candy & Popcorn Cart', price: 3500, maxQuantity: 1 },
        { name: 'Inflatable Bouncy Castle (4 hrs)', price: 5500, maxQuantity: 1 },
      ],
    },
    {
      name: 'Anniversary Romantic Candlelight Elegance',
      slug: 'anniversary-romantic-candlelight-elegance',
      description: 'A magical evening designed to honor lifelong love. Features a private candlelit cabana, violinist accompaniment, and a chef-curated 5-course dinner.',
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
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Live Saxophone Performance Extension', price: 6000, maxQuantity: 1 },
        { name: 'Luxury Leather Album with 30 Couple Prints', price: 4500, maxQuantity: 1 },
      ],
    },
    {
      name: 'Unforgettable Dream Proposal & Engagement',
      slug: 'unforgettable-dream-proposal-engagement',
      description: 'Create a picture-perfect "Yes!" moment with giant Marry Me marquee letters, rose petal pathways, fireworks, and secret paparazzi photography.',
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
      imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Cold-Spark Fountain Pyro during Ring reveal', price: 5000, maxQuantity: 1 },
        { name: 'Drone 4K 60fps Aerial Video highlight', price: 7500, maxQuantity: 1 },
      ],
    },
    {
      name: 'Blissful New Beginnings Baby Shower',
      slug: 'blissful-new-beginnings-baby-shower',
      description: 'A warm, heartwarming celebration for parents-to-be with pastel balloon clouds, floral mom-to-be throne, high-tea pastries, and fun shower games.',
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
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Custom Pastel 2kg Drip Cake', price: 2800, maxQuantity: 1 },
        { name: 'Customized Baby Shower Keepsake Favors (35 pcs)', price: 4200, maxQuantity: 2 },
      ],
    },
    {
      name: 'Royal Heritage Wedding Celebration',
      slug: 'royal-heritage-wedding-celebration',
      description: 'The definitive grand celebration for couples seeking luxury and seamless multi-vendor synergy. Full ballroom, lavish 7-course buffet, and royal floral mandap.',
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
      exclusions: JSON.stringify(['Outstation bridal makeup artist airfare']),
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Luxury Vintage Bridal Entry Car', price: 18000, maxQuantity: 1 },
        { name: 'Traditional Shehnai & Sitar Welcome Troupe', price: 12000, maxQuantity: 1 },
        { name: 'Full Drone 4K Livestream for remote family', price: 15000, maxQuantity: 1 },
      ],
    },
    {
      name: 'Executive Corporate Annual Gala',
      slug: 'executive-corporate-annual-gala',
      description: 'Sophisticated corporate celebration for milestone anniversaries, awards nights, and annual team conferences. Premium AV, podium, and networking dinner.',
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
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      addons: [
        { name: 'Live Stand-up Comedian / Keynote Speaker Set', price: 25000, maxQuantity: 1 },
        { name: 'Branded Photo Booth with Instant Digital Prints', price: 9000, maxQuantity: 1 },
      ],
    },
  ];

  let createdCount = 0;
  for (const p of packagesData) {
    const existing = await prisma.eventPackage.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.eventPackage.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          eventType: p.eventType,
          basePrice: p.basePrice,
          guestCapacity: p.guestCapacity,
          durationHours: p.durationHours,
          inclusions: p.inclusions,
          exclusions: p.exclusions,
          isPopular: p.isPopular,
          isActive: true,
          imageUrl: p.imageUrl,
          addons: {
            create: p.addons,
          },
        },
      });
      createdCount++;
    }
  }

  const total = await prisma.eventPackage.count();
  console.log(`✅ Seed check complete: ${createdCount} packages created. Total active packages: ${total}`);
  return { createdCount, totalPackages: total };
};
