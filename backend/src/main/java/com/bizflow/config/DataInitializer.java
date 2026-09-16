package com.bizflow.config;

import com.bizflow.billing.Order;
import com.bizflow.billing.OrderItem;
import com.bizflow.billing.OrderItemRepository;
import com.bizflow.billing.OrderRepository;
import com.bizflow.billing.OrderStatus;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.BusinessSize;
import com.bizflow.business.BusinessType;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.expense.Expense;
import com.bizflow.expense.ExpenseCategory;
import com.bizflow.expense.ExpenseRepository;
import com.bizflow.inventory.Location;
import com.bizflow.inventory.repository.LocationRepository;
import com.bizflow.payment.Payment;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentRepository;
import com.bizflow.payment.PaymentStatus;
import com.bizflow.product.Category;
import com.bizflow.product.CategoryRepository;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.product.ProductType;
import com.bizflow.review.Review;
import com.bizflow.review.ReviewRepository;
import com.bizflow.user.Role;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final ReviewRepository reviewRepository;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initSeedData() {
        return args -> {
            log.info("Starting BizFlow seed data verification...");

            try {
                // 1. Seed Platform Admins
                seedAdmin("admin@bizflow.com", "Admin@123456", "BizFlow Root Administrator");
                seedAdmin("admin@bizflow.io", "Admin@BizFlow2026!", "Platform Super Admin");
            } catch (Exception ex) {
                log.warn("Notice during admin seeding: {}", ex.getMessage());
            }

            try {
                // 2. Seed 5 Required Demo Business Owners
                seedOmkarRestaurant();
                seedArpitBakery();
                seedSanchitMobileStore();
                seedVedantRetail();
                seedBhaveshCafe();
            } catch (Exception ex) {
                log.warn("Notice during 5 demo business owners seeding: {}", ex.getMessage());
            }

            try {
                // 3. Ensure Legacy Demo Accounts Exist for Backwards Compatibility
                seedSmallBusiness();
                seedLargeBusiness();
                seedLegacyDemoBusiness();
            } catch (Exception ex) {
                log.warn("Notice during legacy demo business seeding: {}", ex.getMessage());
            }

            log.info("BizFlow seed data initialization completed successfully!");
        };
    }

    @Transactional
    public void seedOmkarRestaurant() {
        String ownerEmail = "omkar.patrikar@bizflow.demo";

        Business biz = businessRepository.findByName("Spice Garden Fine Dine").orElseGet(() -> {
            Business b = Business.builder()
                    .name("Spice Garden Fine Dine")
                    .businessType(BusinessType.RESTAURANT)
                    .businessSize(BusinessSize.SMALL)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("info@spicegarden.demo")
                    .phone("+91-98230-11221")
                    .address("45 MG Road, Civil Lines, Nagpur, Maharashtra 440001")
                    .taxRate(new BigDecimal("5.00"))
                    .taxName("GST 5%")
                    .taxNumber("27AAACS1234F1Z1")
                    .taxInclusive(false)
                    .reviewSlug("spice-garden-nagpur")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(b);
        });

        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(biz)
                    .email(ownerEmail)
                    .fullName("Omkar Patrikar")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .phone("+91-98230-11221")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setBusiness(biz);
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Categories & Products
        Category catStarters = getOrCreateCategory(biz, "Starters & Tandoor", "Smoky kebabs, tikkas, and sizzling appetizers");
        Category catMains = getOrCreateCategory(biz, "Main Course Gravies", "Rich North Indian gravies and rich curries");
        Category catBiryani = getOrCreateCategory(biz, "Biryani & Rice", "Fragrant dum biryanis and specialty rice");
        Category catBreads = getOrCreateCategory(biz, "Artisan Tandoori Breads", "Freshly baked naans, rotis, and parathas");
        Category catDesserts = getOrCreateCategory(biz, "Desserts & Beverages", "Traditional sweet delicacies and cooling drinks");

        Product p1 = getOrCreateProduct(biz, catStarters, "Paneer Tikka Angara", "Chargrilled spiced cottage cheese with bell peppers.", 280.00, 110.00, "OMK-PAN-01", 60, 10);
        Product p2 = getOrCreateProduct(biz, catStarters, "Murgh Malai Kebab", "Creamy chicken skewers marinated with cardamom and cream.", 340.00, 140.00, "OMK-CHK-02", 50, 8);
        Product p3 = getOrCreateProduct(biz, catMains, "Butter Chicken Special", "Tender tandoori chicken simmered in rich makhani gravy.", 380.00, 150.00, "OMK-CHK-03", 75, 10);
        Product p4 = getOrCreateProduct(biz, catMains, "Dal Makhani Charcoal", "Slow-cooked black lentils simmered overnight with butter.", 240.00, 85.00, "OMK-DAL-04", 90, 15);
        Product p5 = getOrCreateProduct(biz, catBiryani, "Dum Hyderabadi Mutton Biryani", "Aromatic aged basmati rice cooked with spiced tender goat meat.", 450.00, 200.00, "OMK-MUT-05", 40, 8);
        Product p6 = getOrCreateProduct(biz, catBreads, "Butter Garlic Naan", "Tandoor baked flatbread glazed with melted garlic butter.", 65.00, 20.00, "OMK-NAN-06", 150, 25);
        Product p7 = getOrCreateProduct(biz, catDesserts, "Gulab Jamun with Rabdi", "Warm milk dumplings served over thick creamy saffron rabdi.", 120.00, 40.00, "OMK-GUL-07", 55, 10);

        // Customers
        Customer c1 = getOrCreateCustomer(biz, "Aditya Deshmukh", "+91-98901-11111", "aditya.deshmukh@gmail.com", "Civil Lines, Nagpur", "Regular family diner.");
        Customer c2 = getOrCreateCustomer(biz, "Neha Kulkarni", "+91-98902-22222", "neha.kulkarni@yahoo.com", "Ramdaspeth, Nagpur", "Prefers mild spice.");

        // Orders & Payments
        if (orderRepository.findRecentOrders(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(biz, c1, "INV-OMK-101", "Omkar Patrikar", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p3, 2, 380.00), new ItemSpec(p6, 4, 65.00), new ItemSpec(p7, 2, 120.00)));
            createSampleOrder(biz, c2, "INV-OMK-102", "Omkar Patrikar", owner.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(p1, 1, 280.00), new ItemSpec(p4, 1, 240.00), new ItemSpec(p6, 2, 65.00)));
            createSampleOrder(biz, c1, "INV-OMK-103", "Omkar Patrikar", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p5, 2, 450.00), new ItemSpec(p7, 2, 120.00)));
        }

        // Expenses
        if (expenseRepository.countByBusinessId(biz.getId()) == 0) {
            createExpense(biz, ExpenseCategory.SUPPLIES, "Fresh Farm Dairy & Meat Wholesaler", new BigDecimal("7500.00"), PaymentMethod.UPI, LocalDate.now().minusDays(3), owner);
            createExpense(biz, ExpenseCategory.UTILITIES, "Commercial LPG Gas Cylinder Refills", new BigDecimal("3200.00"), PaymentMethod.CASH, LocalDate.now().minusDays(2), owner);
            createExpense(biz, ExpenseCategory.RENT, "Restaurant Premises Monthly Lease", new BigDecimal("35000.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(10), owner);
        }

        // Reviews
        if (reviewRepository.findRecentReviews(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(biz, 5, "Phenomenal Butter Chicken and top notch hospitality! Best dining in Civil Lines.", "Aditya Deshmukh", "aditya.deshmukh@gmail.com", true);
            createReview(biz, 5, "Authentic flavours and speedy billing. Highly recommended!", "Neha Kulkarni", "neha.kulkarni@yahoo.com", true);
        }
        log.info("Demo Business #1: Omkar Patrikar (Spice Garden Fine Dine) initialized.");
    }

    @Transactional
    public void seedArpitBakery() {
        String ownerEmail = "arpit.raut@bizflow.demo";

        Business biz = businessRepository.findByName("Golden Crust Artisan Bakery").orElseGet(() -> {
            Business b = Business.builder()
                    .name("Golden Crust Artisan Bakery")
                    .businessType(BusinessType.BAKERY)
                    .businessSize(BusinessSize.SMALL)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("hello@goldencrust.demo")
                    .phone("+91-98230-22332")
                    .address("12 Dharampeth Shopping Arcade, Nagpur, Maharashtra 440010")
                    .taxRate(new BigDecimal("5.00"))
                    .taxName("GST 5%")
                    .taxNumber("27BBBCS2345G1Z2")
                    .taxInclusive(true)
                    .reviewSlug("golden-crust-nagpur")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(b);
        });

        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(biz)
                    .email(ownerEmail)
                    .fullName("Arpit Raut")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .phone("+91-98230-22332")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setBusiness(biz);
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Categories & Products
        Category catSourdough = getOrCreateCategory(biz, "Artisan Breads & Sourdough", "Naturally fermented sourdough loaves and rustic loaves");
        Category catCakes = getOrCreateCategory(biz, "Celebration Cakes", "Handcrafted designer cakes and truffle celebrations");
        Category catPastries = getOrCreateCategory(biz, "Croissants & Pastries", "Flaky French viennoiseries and Danishes");
        Category catCookies = getOrCreateCategory(biz, "Gourmet Cookies & Bakes", "Crunchy butter biscuits, cookies, and tea-time loaves");

        Product p1 = getOrCreateProduct(biz, catSourdough, "Rustic Sourdough Boule", "Traditional 36-hour fermented whole wheat sourdough bread.", 160.00, 60.00, "ARP-SRD-01", 35, 5);
        Product p2 = getOrCreateProduct(biz, catCakes, "Belgian Dark Truffle Cake 1kg", "Dense Dutch cocoa sponge layered with 70% dark ganache.", 750.00, 320.00, "ARP-CAK-02", 15, 3);
        Product p3 = getOrCreateProduct(biz, catPastries, "Butter Almond Croissant", "Laminated twice-baked croissant stuffed with almond frangipane.", 140.00, 50.00, "ARP-CRS-03", 30, 6);
        Product p4 = getOrCreateProduct(biz, catCakes, "Red Velvet Cream Cheese Cupcake", "Velvety sponge topped with imported Philadelphia cream cheese frosting.", 120.00, 45.00, "ARP-CUP-04", 40, 8);
        Product p5 = getOrCreateProduct(biz, catCookies, "Chocochip Walnut Cookies 250g", "Gooey chocolate chunk cookies with roasted California walnuts.", 180.00, 70.00, "ARP-CKI-05", 50, 10);
        Product p6 = getOrCreateProduct(biz, catSourdough, "Cheese Garlic Pull-Apart Loaf", "Soft sourdough loaf infused with herb garlic butter and mozzarella.", 150.00, 55.00, "ARP-GAR-06", 25, 5);

        // Customers
        Customer c1 = getOrCreateCustomer(biz, "Tanvi Joshi", "+91-98904-44444", "tanvi.joshi@gmail.com", "Dharampeth, Nagpur", "Loves sourdough bread.");
        Customer c2 = getOrCreateCustomer(biz, "Kunal Patil", "+91-98905-55555", "kunal.patil@outlook.com", "Laxmi Nagar, Nagpur", "Orders birthday cakes.");

        // Orders & Payments
        if (orderRepository.findRecentOrders(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(biz, c1, "INV-ARP-101", "Arpit Raut", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p1, 2, 160.00), new ItemSpec(p3, 2, 140.00)));
            createSampleOrder(biz, c2, "INV-ARP-102", "Arpit Raut", owner.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(p2, 1, 750.00), new ItemSpec(p5, 1, 180.00)));
            createSampleOrder(biz, c1, "INV-ARP-103", "Arpit Raut", owner.getId(), PaymentMethod.CASH,
                    List.of(new ItemSpec(p6, 2, 150.00), new ItemSpec(p4, 2, 120.00)));
        }

        // Expenses
        if (expenseRepository.countByBusinessId(biz.getId()) == 0) {
            createExpense(biz, ExpenseCategory.SUPPLIES, "Organic Unbleached Flour & Dairy Butter 50kg", new BigDecimal("6200.00"), PaymentMethod.UPI, LocalDate.now().minusDays(5), owner);
            createExpense(biz, ExpenseCategory.UTILITIES, "Bakery Oven Electric Load Tariff", new BigDecimal("4800.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(4), owner);
        }

        // Reviews
        if (reviewRepository.findRecentReviews(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(biz, 5, "The best sourdough in the city! Crusty outside and super soft inside.", "Tanvi Joshi", "tanvi.joshi@gmail.com", true);
        }
        log.info("Demo Business #2: Arpit Raut (Golden Crust Artisan Bakery) initialized.");
    }

    @Transactional
    public void seedSanchitMobileStore() {
        String ownerEmail = "sanchit.maske@bizflow.demo";

        Business biz = businessRepository.findByName("NextGen Mobile & Tech Hub").orElseGet(() -> {
            Business b = Business.builder()
                    .name("NextGen Mobile & Tech Hub")
                    .businessType(BusinessType.MOBILE_STORE)
                    .businessSize(BusinessSize.SMALL)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("sales@nextgenmobile.demo")
                    .phone("+91-98230-33443")
                    .address("Shop 8, Sitabuldi Main Road, Nagpur, Maharashtra 440012")
                    .taxRate(new BigDecimal("18.00"))
                    .taxName("GST 18%")
                    .taxNumber("27CCCDS3456H1Z3")
                    .taxInclusive(false)
                    .reviewSlug("nextgen-mobile-nagpur")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(b);
        });

        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(biz)
                    .email(ownerEmail)
                    .fullName("Sanchit Maske")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .phone("+91-98230-33443")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setBusiness(biz);
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Categories & Products
        Category catPhones = getOrCreateCategory(biz, "Smartphones & Tablets", "Latest 5G smartphones, flagship devices, and tablets");
        Category catPower = getOrCreateCategory(biz, "Chargers & Power Banks", "Fast GaN chargers, wireless pads, and power banks");
        Category catAudio = getOrCreateCategory(biz, "Audio & Smart Wearables", "ANC Earbuds, neckbands, and smart fitness watches");
        Category catProtection = getOrCreateCategory(biz, "Cases & Screen Protectors", "Shockproof phone cases and 9H tempered glass guards");

        Product p1 = getOrCreateProduct(biz, catPhones, "ProMax 5G Smartphone 128GB", "Flagship 120Hz AMOLED, 5000mAh battery, 50MP OIS Camera.", 24999.00, 21500.00, "SAN-PHN-01", 18, 4);
        Product p2 = getOrCreateProduct(biz, catPower, "65W GaN Superfast Dual Charger", "Universal USB-C Power Delivery wall adapter for laptops & phones.", 1499.00, 780.00, "SAN-CHG-02", 45, 8);
        Product p3 = getOrCreateProduct(biz, catAudio, "ANC True Wireless Earbuds Pro", "Active Noise Cancelling earbuds with 36h playback and low latency.", 2999.00, 1600.00, "SAN-EAR-03", 30, 5);
        Product p4 = getOrCreateProduct(biz, catPower, "10000mAh Magnetic Power Bank", "Slim MagSafe compatible 20W fast wireless power bank.", 1899.00, 950.00, "SAN-PWR-04", 25, 5);
        Product p5 = getOrCreateProduct(biz, catProtection, "9H Edge-to-Edge Tempered Glass", "Oleophobic shatterproof curved screen protector.", 299.00, 60.00, "SAN-GLS-05", 120, 20);
        Product p6 = getOrCreateProduct(biz, catProtection, "Military-Grade Armor Shock Case", "Dual-layer rugged TPU drop protection bumper case.", 499.00, 150.00, "SAN-CSE-06", 80, 15);

        // Customers
        Customer c1 = getOrCreateCustomer(biz, "Rohan Bajaj", "+91-98906-66666", "rohan.bajaj@gmail.com", "Sitabuldi, Nagpur", "Tech enthusiast.");
        Customer c2 = getOrCreateCustomer(biz, "Pooja Mehta", "+91-98907-77777", "pooja.mehta@yahoo.com", "Dhantoli, Nagpur", "Accessories buyer.");

        // Orders & Payments
        if (orderRepository.findRecentOrders(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(biz, c1, "INV-SAN-101", "Sanchit Maske", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p1, 1, 24999.00), new ItemSpec(p5, 1, 299.00), new ItemSpec(p6, 1, 499.00)));
            createSampleOrder(biz, c2, "INV-SAN-102", "Sanchit Maske", owner.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(p2, 1, 1499.00), new ItemSpec(p3, 1, 2999.00)));
            createSampleOrder(biz, c1, "INV-SAN-103", "Sanchit Maske", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p4, 1, 1899.00)));
        }

        // Expenses
        if (expenseRepository.countByBusinessId(biz.getId()) == 0) {
            createExpense(biz, ExpenseCategory.PURCHASE, "Authorized Mobile Distributor Inward Batch", new BigDecimal("48000.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(7), owner);
            createExpense(biz, ExpenseCategory.RENT, "Sitabuldi Prime Shop Monthly Rent", new BigDecimal("22000.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(5), owner);
        }

        // Reviews
        if (reviewRepository.findRecentReviews(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(biz, 5, "Great deal on the new 5G phone! Sanchit was very helpful with data transfer.", "Rohan Bajaj", "rohan.bajaj@gmail.com", true);
        }
        log.info("Demo Business #3: Sanchit Maske (NextGen Mobile & Tech Hub) initialized.");
    }

    @Transactional
    public void seedVedantRetail() {
        String ownerEmail = "vedant.bhoyar@bizflow.demo";

        Business biz = businessRepository.findByName("Urban Style Fashion & Apparel").orElseGet(() -> {
            Business b = Business.builder()
                    .name("Urban Style Fashion & Apparel")
                    .businessType(BusinessType.RETAIL)
                    .businessSize(BusinessSize.LARGE)
                    .currency("USD")
                    .timezone("UTC")
                    .email("contact@urbanstyle.demo")
                    .phone("+91-98230-44554")
                    .address("Plot 104, Wardha Road, Ramdaspeth, Nagpur, Maharashtra 440015")
                    .taxRate(new BigDecimal("8.50"))
                    .taxName("Sales Tax 8.5%")
                    .taxNumber("US-TAX-89211")
                    .taxInclusive(false)
                    .reviewSlug("urban-style-nagpur")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(b);
        });

        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(biz)
                    .email(ownerEmail)
                    .fullName("Vedant Bhoyar")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .phone("+91-98230-44554")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setBusiness(biz);
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Warehouses & Store Locations (Large Business tier)
        Location locStore = getOrCreateLocation(biz, "Urban Style Flagship Store", "LOC-US-01", "Plot 104, Wardha Road, Ramdaspeth", "+91-98230-44554", true);
        Location locWarehouse = getOrCreateLocation(biz, "Central Logistics Hub", "LOC-US-02", "MIDC Logistics Park, Wardha Road", "+91-98230-44555", false);

        // Categories & Products
        Category catMen = getOrCreateCategory(biz, "Men's Casual Wear", "Premium cotton shirts, polos, and casual trousers");
        Category catWomen = getOrCreateCategory(biz, "Women's Ethnic & Modern", "Contemporary kurtas, dresses, and designer tops");
        Category catDenim = getOrCreateCategory(biz, "Denims & Jeans", "Selvedge denim, stretch slim jeans, and jackets");
        Category catFootwear = getOrCreateCategory(biz, "Footwear & Accessories", "Genuine leather belts, sneakers, and wallets");

        Product p1 = getOrCreateProduct(biz, catMen, "Classic Oxford Button-Down Shirt", "100% breathable organic Egyptian cotton tailored fit shirt.", 45.00, 18.00, "VED-SHT-01", 60, 10);
        Product p2 = getOrCreateProduct(biz, catDenim, "Slim Stretch Selvedge Denim Jeans", "13oz raw denim with comfort stretch and reinforced rivets.", 65.00, 26.00, "VED-DNM-02", 45, 8);
        Product p3 = getOrCreateProduct(biz, catWomen, "Embroidered Linen Tunic Dress", "Breezy summer linen tunic with subtle artisan embroidery.", 55.00, 22.00, "VED-DRS-03", 35, 6);
        Product p4 = getOrCreateProduct(biz, catFootwear, "Full Grain Leather Dress Belt", "Hand-stitched brass buckle full grain vegetable tanned leather belt.", 30.00, 11.00, "VED-BLT-04", 50, 10);
        Product p5 = getOrCreateProduct(biz, catFootwear, "Urban Canvas Low-Top Sneakers", "Vulcanized rubber sole casual street lifestyle sneakers.", 50.00, 20.00, "VED-SNK-05", 40, 8);

        // Customers
        Customer c1 = getOrCreateCustomer(biz, "Suresh Menon", "+91-98908-88888", "suresh.menon@gmail.com", "Wardha Road, Nagpur", "VIP fashion member.");
        Customer c2 = getOrCreateCustomer(biz, "Ananya Sen", "+91-98909-99999", "ananya.sen@outlook.com", "Civil Lines, Nagpur", "Frequent shopper.");

        // Orders & Payments
        if (orderRepository.findRecentOrders(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(biz, c1, "INV-VED-101", "Vedant Bhoyar", owner.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(p1, 2, 45.00), new ItemSpec(p2, 1, 65.00), new ItemSpec(p4, 1, 30.00)));
            createSampleOrder(biz, c2, "INV-VED-102", "Vedant Bhoyar", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p3, 2, 55.00), new ItemSpec(p5, 1, 50.00)));
        }

        // Expenses
        if (expenseRepository.countByBusinessId(biz.getId()) == 0) {
            createExpense(biz, ExpenseCategory.PURCHASE, "Autumn Apparel Consignment Import", new BigDecimal("3200.00"), PaymentMethod.CARD, LocalDate.now().minusDays(8), owner);
            createExpense(biz, ExpenseCategory.MARKETING, "Digital Social Media Campaign & Billboards", new BigDecimal("650.00"), PaymentMethod.CARD, LocalDate.now().minusDays(3), owner);
        }

        // Reviews
        if (reviewRepository.findRecentReviews(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(biz, 5, "Exceptional fabric quality and modern styles. Very satisfied!", "Suresh Menon", "suresh.menon@gmail.com", true);
        }
        log.info("Demo Business #4: Vedant Bhoyar (Urban Style Fashion & Apparel) initialized.");
    }

    @Transactional
    public void seedBhaveshCafe() {
        String ownerEmail = "bhavesh.gautre@bizflow.demo";

        Business biz = businessRepository.findByName("Roasted Bean Specialty Cafe").orElseGet(() -> {
            Business b = Business.builder()
                    .name("Roasted Bean Specialty Cafe")
                    .businessType(BusinessType.CAFE)
                    .businessSize(BusinessSize.SMALL)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("connect@roastedbean.demo")
                    .phone("+91-98230-55665")
                    .address("22 IT Park Road, Gayatri Nagar, Nagpur, Maharashtra 440022")
                    .taxRate(new BigDecimal("5.00"))
                    .taxName("GST 5%")
                    .taxNumber("27EEEDS5678J1Z5")
                    .taxInclusive(false)
                    .reviewSlug("roasted-bean-nagpur")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(b);
        });

        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(biz)
                    .email(ownerEmail)
                    .fullName("Bhavesh Gautre")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .phone("+91-98230-55665")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setBusiness(biz);
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Categories & Products
        Category catCoffee = getOrCreateCategory(biz, "Specialty Coffees & Brews", "Single origin pour-overs, cold brews, and espresso classics");
        Category catTeas = getOrCreateCategory(biz, "Matcha & Artisanal Teas", "Japanese matcha, herbal infusions, and craft kombucha");
        Category catFood = getOrCreateCategory(biz, "All-Day Bagels & Gourmet Toasties", "Artisan toasted bagels and grilled sourdough sandwiches");
        Category catDesserts = getOrCreateCategory(biz, "Handcrafted Desserts", "Warm skillet brownies, cinnamon rolls, and banana bread");

        Product p1 = getOrCreateProduct(biz, catCoffee, "Single-Origin Pour Over (Ethiopia)", "Floral and citrus notes brewed with v60 manual dripper.", 220.00, 75.00, "BHA-POU-01", 50, 10);
        Product p2 = getOrCreateProduct(biz, catCoffee, "Signature Spanish Vanilla Latte", "Double shot espresso with condensed milk and Madagascar vanilla.", 190.00, 60.00, "BHA-LAT-02", 65, 12);
        Product p3 = getOrCreateProduct(biz, catTeas, "Ceremonial Grade Iced Matcha Latte", "Organic Uji matcha whisked with oat milk and agave nectar.", 240.00, 85.00, "BHA-MTC-03", 40, 8);
        Product p4 = getOrCreateProduct(biz, catFood, "Smoked Cottage Cheese Panini", "Grilled sourdough panini with smoked paneer and basil pesto.", 210.00, 70.00, "BHA-PAN-04", 35, 6);
        Product p5 = getOrCreateProduct(biz, catFood, "Toasted Jalapeno Cream Cheese Bagel", "Freshly baked sesame bagel with herb garlic cream cheese.", 180.00, 55.00, "BHA-BGL-05", 30, 6);
        Product p6 = getOrCreateProduct(biz, catDesserts, "Gooey Espresso Salted Caramel Brownie", "Fudgy Belgian chocolate brownie with sea salt caramel drizzle.", 160.00, 50.00, "BHA-BRN-06", 45, 10);

        // Customers
        Customer c1 = getOrCreateCustomer(biz, "Vikram Singhania", "+91-98910-10101", "vikram.singh@itpark.in", "Gayatri Nagar, Nagpur", "Daily remote worker.");
        Customer c2 = getOrCreateCustomer(biz, "Divya Roy", "+91-98910-20202", "divya.roy@gmail.com", "Pratap Nagar, Nagpur", "Matcha lover.");

        // Orders & Payments
        if (orderRepository.findRecentOrders(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(biz, c1, "INV-BHA-101", "Bhavesh Gautre", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p1, 1, 220.00), new ItemSpec(p5, 1, 180.00)));
            createSampleOrder(biz, c2, "INV-BHA-102", "Bhavesh Gautre", owner.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(p3, 2, 240.00), new ItemSpec(p6, 2, 160.00)));
            createSampleOrder(biz, c1, "INV-BHA-103", "Bhavesh Gautre", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p2, 2, 190.00), new ItemSpec(p4, 1, 210.00)));
        }

        // Expenses
        if (expenseRepository.countByBusinessId(biz.getId()) == 0) {
            createExpense(biz, ExpenseCategory.SUPPLIES, "Specialty Green Coffee Beans & Organic Whole Milk", new BigDecimal("5600.00"), PaymentMethod.UPI, LocalDate.now().minusDays(3), owner);
            createExpense(biz, ExpenseCategory.UTILITIES, "High Speed Fiber Internet & Cafe Electricity", new BigDecimal("3100.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(1), owner);
        }

        // Reviews
        if (reviewRepository.findRecentReviews(biz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(biz, 5, "My favorite work cafe near IT Park! Amazing Spanish latte and peaceful vibe.", "Vikram Singhania", "vikram.singh@itpark.in", true);
        }
        log.info("Demo Business #5: Bhavesh Gautre (Roasted Bean Specialty Cafe) initialized.");
    }

    @Transactional
    public void seedSmallBusiness() {
        String ownerEmail = "owner@chaiandbites.in";
        String staffEmail = "staff@chaiandbites.in";

        Business smallBiz = businessRepository.findByName("Chai & Bites Café").orElseGet(() -> {
            Business biz = Business.builder()
                    .name("Chai & Bites Café")
                    .businessType(BusinessType.CAFE)
                    .businessSize(BusinessSize.SMALL)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("contact@chaiandbites.in")
                    .phone("+91-98765-43210")
                    .address("Shop #14, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .taxRate(new BigDecimal("5.00"))
                    .taxName("GST 5%")
                    .taxNumber("29ABCDE1234F1Z5")
                    .taxInclusive(false)
                    .reviewSlug("chai-and-bites-cafe")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(biz);
        });

        // Ensure small business owner
        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(smallBiz)
                    .email(ownerEmail)
                    .fullName("Arjun Kapoor")
                    .passwordHash(passwordEncoder.encode("Owner@123456"))
                    .phone("+91-98765-43210")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setPasswordHash(passwordEncoder.encode("Owner@123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Ensure small business staff
        User staff = userRepository.findByEmailIgnoreCase(staffEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(smallBiz)
                    .email(staffEmail)
                    .fullName("Pooja Nair")
                    .passwordHash(passwordEncoder.encode("Staff@123456"))
                    .phone("+91-98765-43211")
                    .role(Role.STAFF)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        staff.setPasswordHash(passwordEncoder.encode("Staff@123456"));
        staff.setEnabled(true);
        staff.setActive(true);
        userRepository.save(staff);

        // Seed Categories for Small Business
        Category catHotBev = getOrCreateCategory(smallBiz, "Hot Beverages", "Traditional Masala Chai, Special Teas, Artisan Filter Coffee & Hot Cocoa");
        Category catColdBev = getOrCreateCategory(smallBiz, "Cold Brews & Coolers", "Iced Frappes, Cold Coffee, Fresh Mojitos & Milkshakes");
        Category catBakery = getOrCreateCategory(smallBiz, "Artisan Bakery", "Freshly baked muffins, cookies, croissants & pastries");
        Category catSnacks = getOrCreateCategory(smallBiz, "Snacks & Sandwiches", "Gourmet grilled sandwiches, sourdough toasts & savory quick bites");
        Category catDesserts = getOrCreateCategory(smallBiz, "Desserts & Sweets", "Decadent chocolate brownies, cheesecakes & sundaes");

        // Seed Products for Small Business
        Product p1 = getOrCreateProduct(smallBiz, catHotBev, "Kadak Masala Chai Special", "Signature freshly brewed spiced milk tea with ginger, cardamom, and clove.", 30.00, 8.00, "CHAI-MASALA-01", 180, 20);
        Product p2 = getOrCreateProduct(smallBiz, catHotBev, "South Indian Filter Coffee", "Traditional strong decoction blended with frothy boiled milk.", 45.00, 12.00, "COF-FILTER-02", 140, 15);
        Product p3 = getOrCreateProduct(smallBiz, catHotBev, "Ginger Lemon Green Tea", "Refreshing antioxidant green tea infused with fresh ginger and honey.", 60.00, 15.00, "TEA-GRN-GIN-03", 85, 10);
        Product p4 = getOrCreateProduct(smallBiz, catColdBev, "Iced Caramel Frappe", "Blended double espresso, caramel syrup, chilled milk, and whipped cream.", 160.00, 48.00, "BEV-FRAP-CAR-04", 60, 10);
        Product p5 = getOrCreateProduct(smallBiz, catColdBev, "Belgian Cold Coffee Float", "Thick creamy cold coffee topped with rich vanilla ice cream scoop.", 140.00, 42.00, "BEV-CLD-COF-05", 75, 10);
        Product p6 = getOrCreateProduct(smallBiz, catBakery, "Wild Blueberry Muffin", "Soft golden muffin baked with juicy wild blueberries.", 95.00, 32.00, "BAK-MUF-BLU-06", 28, 8);
        Product p7 = getOrCreateProduct(smallBiz, catBakery, "Butter Croissant", "Flaky, buttery French-style croissant freshly baked every morning.", 85.00, 28.00, "BAK-CRS-BUT-07", 22, 6);
        Product p8 = getOrCreateProduct(smallBiz, catSnacks, "Gourmet Paneer Tikka Sandwich", "Spiced cottage cheese cubes, mint chutney, bell peppers in grilled bread.", 180.00, 62.00, "SNK-SND-PAN-08", 45, 10);
        Product p9 = getOrCreateProduct(smallBiz, catSnacks, "Cheesy Garlic Sourdough Toast", "Toasted artisan sourdough with roasted garlic butter and melted mozzarella.", 130.00, 40.00, "SNK-TOA-GAR-09", 35, 8);
        Product p10 = getOrCreateProduct(smallBiz, catDesserts, "Warm Belgian Chocolate Brownie", "Fudgy dark chocolate brownie served warm with chocolate drizzle.", 140.00, 45.00, "DES-BRN-BEL-10", 30, 8);

        // Seed Customers for Small Business
        Customer c1 = getOrCreateCustomer(smallBiz, "Rahul Sharma", "+91-98450-12345", "rahul.sharma@gmail.com", "12th Main, HAL 2nd Stage, Indiranagar, Bengaluru", "Prefers less sugar in chai.");
        Customer c2 = getOrCreateCustomer(smallBiz, "Priya Venkatesh", "+91-98451-23456", "priya.venkat@outlook.com", "Defence Colony, Indiranagar, Bengaluru", "Loves blueberry muffins and cold brews.");
        Customer c3 = getOrCreateCustomer(smallBiz, "Amitabh Roy", "+91-98452-34567", "amit.roy@techcorp.in", "EGL Business Park, Domlur, Bengaluru", "Corporate orders coordinator for team meetings.");
        Customer c4 = getOrCreateCustomer(smallBiz, "Sneha Hegde", "+91-98453-45678", "sneha.hegde@yahoo.com", "CMH Road, Indiranagar, Bengaluru", "Weekend brunch regular.");

        // Seed Sample Orders for Small Business
        if (orderRepository.findRecentOrders(smallBiz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(smallBiz, c1, "INV-CB-1001", "Arjun Kapoor", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p1, 2, 30.00), new ItemSpec(p7, 1, 85.00)));
            createSampleOrder(smallBiz, c2, "INV-CB-1002", "Pooja Nair", staff.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(p4, 1, 160.00), new ItemSpec(p6, 1, 95.00)));
            createSampleOrder(smallBiz, c3, "INV-CB-1003", "Arjun Kapoor", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p8, 3, 180.00), new ItemSpec(p5, 1, 140.00)));
            createSampleOrder(smallBiz, c4, "INV-CB-1004", "Pooja Nair", staff.getId(), PaymentMethod.CASH,
                    List.of(new ItemSpec(p8, 1, 180.00), new ItemSpec(p9, 1, 130.00)));
            createSampleOrder(smallBiz, c1, "INV-CB-1005", "Pooja Nair", staff.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p2, 1, 45.00), new ItemSpec(p9, 1, 130.00)));
            createSampleOrder(smallBiz, c2, "INV-CB-1006", "Arjun Kapoor", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(p4, 1, 160.00), new ItemSpec(p8, 1, 180.00), new ItemSpec(p10, 1, 140.00)));
        }

        // Seed Expenses for Small Business
        if (expenseRepository.countByBusinessId(smallBiz.getId()) == 0) {
            createExpense(smallBiz, ExpenseCategory.SUPPLIES, "Weekly Fresh Dairy & Organic Whole Milk", new BigDecimal("4200.00"), PaymentMethod.UPI, LocalDate.now().minusDays(6), owner);
            createExpense(smallBiz, ExpenseCategory.SUPPLIES, "Arabica Dark Roast Coffee Beans 5kg", new BigDecimal("3850.00"), PaymentMethod.CARD, LocalDate.now().minusDays(4), owner);
            createExpense(smallBiz, ExpenseCategory.UTILITIES, "Electricity Utility Bill - Store Meter", new BigDecimal("5420.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(3), owner);
            createExpense(smallBiz, ExpenseCategory.MAINTENANCE, "Espresso Machine Servicing & Descaling", new BigDecimal("1800.00"), PaymentMethod.CASH, LocalDate.now().minusDays(1), owner);
        }

        // Seed Reviews for Small Business
        if (reviewRepository.findRecentReviews(smallBiz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(smallBiz, 5, "The masala chai and sourdough toasts are unmatched in Indiranagar! Cozy atmosphere.", "Rahul Sharma", "rahul.sharma@gmail.com", true);
            createReview(smallBiz, 5, "Best blueberry muffin I have ever tasted in Bengaluru. Lovely staff!", "Priya Venkatesh", "priya.venkat@outlook.com", true);
            createReview(smallBiz, 4, "Great filter coffee and sandwiches. Seating fills up fast during evening peak hours.", "Amitabh Roy", "amit.roy@techcorp.in", true);
        }

        log.info("Small Business demo credentials (Chai & Bites Café) ready: {} & {}", ownerEmail, staffEmail);
    }

    @Transactional
    public void seedLargeBusiness() {
        String ownerEmail = "owner@apexretail.in";
        String managerEmail = "manager@apexretail.in";
        String cashierEmail = "cashier@apexretail.in";

        Business largeBiz = businessRepository.findByName("Apex Electronics & Retail Hub").orElseGet(() -> {
            Business biz = Business.builder()
                    .name("Apex Electronics & Retail Hub")
                    .businessType(BusinessType.RETAIL)
                    .businessSize(BusinessSize.LARGE)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("support@apexretail.in")
                    .phone("+91-80-4999-8800")
                    .address("Apex Corporate Towers, #88 Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103")
                    .taxRate(new BigDecimal("18.00"))
                    .taxName("GST 18%")
                    .taxNumber("29AAACA1234F1Z8")
                    .taxInclusive(false)
                    .reviewSlug("apex-electronics-hub")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(biz);
        });

        // Ensure large business owner
        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(largeBiz)
                    .email(ownerEmail)
                    .fullName("Rajesh Singhania")
                    .passwordHash(passwordEncoder.encode("Owner@123456"))
                    .phone("+91-98800-11223")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setPasswordHash(passwordEncoder.encode("Owner@123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        // Ensure large business manager
        User mgr = userRepository.findByEmailIgnoreCase(managerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(largeBiz)
                    .email(managerEmail)
                    .fullName("Kavita Joshi")
                    .passwordHash(passwordEncoder.encode("Staff@123456"))
                    .phone("+91-98800-22334")
                    .role(Role.STAFF)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        mgr.setPasswordHash(passwordEncoder.encode("Staff@123456"));
        mgr.setEnabled(true);
        mgr.setActive(true);
        userRepository.save(mgr);

        // Ensure large business cashier
        User cashier = userRepository.findByEmailIgnoreCase(cashierEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(largeBiz)
                    .email(cashierEmail)
                    .fullName("Manoj Kumar")
                    .passwordHash(passwordEncoder.encode("Staff@123456"))
                    .phone("+91-98800-33445")
                    .role(Role.STAFF)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        cashier.setPasswordHash(passwordEncoder.encode("Staff@123456"));
        cashier.setEnabled(true);
        cashier.setActive(true);
        userRepository.save(cashier);

        // Seed Locations
        getOrCreateLocation(largeBiz, "Indiranagar Flagship Store", "LOC-BLR-01", "100 Feet Road, Indiranagar, Bengaluru", "+91-80-4999-8801", true);
        getOrCreateLocation(largeBiz, "Koramangala Tech Hub", "LOC-BLR-02", "80 Feet Road, 4th Block, Koramangala, Bengaluru", "+91-80-4999-8802", false);
        getOrCreateLocation(largeBiz, "Whitefield Distribution Warehouse", "WH-WFD-01", "Plot 42, Export Promotion Industrial Zone, Whitefield", "+91-80-4999-8803", false);

        // Seed Categories for Large Business
        Category catPhones = getOrCreateCategory(largeBiz, "Smartphones & Tablets", "Flagship Android devices, tablets, and e-readers");
        Category catLaptops = getOrCreateCategory(largeBiz, "Laptops & Computing", "Ultrabooks, gaming rigs, workstations, and monitors");
        Category catAudio = getOrCreateCategory(largeBiz, "Audio & Wearables", "ANC wireless headphones, earbuds, and smart fitness watches");
        Category catPower = getOrCreateCategory(largeBiz, "Power & Cables", "GaN fast chargers, braided high-speed cables, and power banks");
        Category catAccessories = getOrCreateCategory(largeBiz, "Peripherals & Accessories", "Mechanical keyboards, ergonomic mice, webcams & docks");

        // Seed Products for Large Business
        Product lp1 = getOrCreateProduct(largeBiz, catPhones, "Galaxy Tab S9 FE+ 128GB Wi-Fi", "12.4-inch display, S Pen included, IP68 water resistance.", 44999.00, 35500.00, "SAM-TAB-S9FE-GRY", 28, 5);
        Product lp2 = getOrCreateProduct(largeBiz, catPhones, "Galaxy S24 5G 256GB Onyx Black", "Snapdragon 8 Gen 3, ProVisual Engine, AI live translate.", 79999.00, 66000.00, "SAM-PHN-S24-BLK", 18, 4);
        Product lp3 = getOrCreateProduct(largeBiz, catLaptops, "Dell XPS 13 Ultrabook Core i7 16GB", "Intel Core i7 13th Gen, 16GB LPDDR5, 512GB NVMe SSD.", 114999.00, 92000.00, "DEL-LAP-XPS13-SLV", 12, 3);
        Product lp4 = getOrCreateProduct(largeBiz, catLaptops, "Dell 27\" 4K UHD USB-C Hub Monitor", "3840 x 2160 IPS, 99% sRGB, 65W USB-C Power Delivery.", 28999.00, 21500.00, "DEL-MON-27UHD-IPS", 24, 5);
        Product lp5 = getOrCreateProduct(largeBiz, catAudio, "boAt Nirvana Ion ANC Earbuds", "Hybrid Active Noise Cancellation 32dB, 120H total playback.", 2999.00, 1450.00, "BOT-EAR-NIRV-BLK", 85, 15);
        Product lp6 = getOrCreateProduct(largeBiz, catAudio, "boAt Wave Pro Smartwatch AMOLED", "1.96-inch HD AMOLED display, Bluetooth calling, 100+ sports modes.", 3499.00, 1800.00, "BOT-WAT-WAVE-BLU", 64, 10);
        Product lp7 = getOrCreateProduct(largeBiz, catPower, "65W GaN Fast Dual Port Wall Charger", "Ultra-compact Gallium Nitride tech with USB-C PD 3.0.", 1899.00, 780.00, "PWR-GAN-65W-WHT", 120, 20);
        Product lp8 = getOrCreateProduct(largeBiz, catPower, "Braided 100W USB-C to USB-C Cable 2M", "E-marker smart chip, 480Mbps data sync, heavy-duty weave.", 599.00, 190.00, "CAB-USBC-100W-2M", 150, 25);
        Product lp9 = getOrCreateProduct(largeBiz, catAccessories, "RGB Mechanical Gaming Keyboard (Red Switch)", "Hot-swappable linear mechanical switches, aluminum frame.", 4499.00, 2300.00, "ACC-KBD-MECH-RED", 42, 8);
        Product lp10 = getOrCreateProduct(largeBiz, catAccessories, "Ergonomic Vertical Wireless Mouse", "Natural handshake posture, dual Bluetooth + 2.4GHz USB receiver.", 1799.00, 720.00, "ACC-MOU-ERGO-VRT", 55, 10);
        Product lp11 = getOrCreateProduct(largeBiz, catAccessories, "10-in-1 Multiport USB-C Aluminum Dock", "4K HDMI, Gigabit Ethernet, 100W PD Pass-thru, SD/TF Card Reader.", 3999.00, 1850.00, "ACC-DCK-10IN1-GRY", 38, 6);

        // Seed Customers
        Customer lc1 = getOrCreateCustomer(largeBiz, "Kishore Kumar V", "+91-99001-11222", "kishore.kv@infosys.com", "Electronics City, Bengaluru", "Enterprise IT buyer");
        Customer lc2 = getOrCreateCustomer(largeBiz, "Shalini Sundaram", "+91-99002-22333", "shalini.s@wipro.com", "Sarjapur Road, Bengaluru", "Frequent buyer of audio gear");

        // Seed Sample Orders
        if (orderRepository.findRecentOrders(largeBiz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(largeBiz, lc1, "INV-APEX-2001", "Kavita Joshi", mgr.getId(), PaymentMethod.CARD,
                    List.of(new ItemSpec(lp3, 1, 114999.00), new ItemSpec(lp4, 1, 28999.00)));
            createSampleOrder(largeBiz, lc2, "INV-APEX-2002", "Manoj Kumar", cashier.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(lp5, 1, 2999.00), new ItemSpec(lp7, 1, 1899.00), new ItemSpec(lp8, 2, 599.00)));
        }

        // Seed Expenses
        if (expenseRepository.countByBusinessId(largeBiz.getId()) == 0) {
            createExpense(largeBiz, ExpenseCategory.RENT, "Indiranagar Flagship Showroom Commercial Lease", new BigDecimal("125000.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(5), owner);
            createExpense(largeBiz, ExpenseCategory.UTILITIES, "High-tension Power Bill - Warehouse & Showroom", new BigDecimal("18450.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(2), owner);
        }

        // Seed Reviews
        if (reviewRepository.findRecentReviews(largeBiz.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(largeBiz, 5, "Excellent showroom and authentic gadgets with official warranty support!", "Kishore Kumar V", "kishore.kv@infosys.com", true);
        }

        log.info("Large Business demo credentials (Apex Electronics) ready: {}, {}, {}", ownerEmail, managerEmail, cashierEmail);
    }

    @Transactional
    public void seedLegacyDemoBusiness() {
        String ownerEmail = "owner@example.com";
        String staffEmail = "staff@example.com";

        Business demoBusiness = businessRepository.findByName("BizFlow Retail Express").orElseGet(() -> {
            Business biz = Business.builder()
                    .name("BizFlow Retail Express")
                    .businessType(BusinessType.RETAIL)
                    .businessSize(BusinessSize.SMALL)
                    .currency("INR")
                    .timezone("Asia/Kolkata")
                    .email("contact@bizflowretail.com")
                    .phone("+91-98765-00000")
                    .address("742 Evergreen Terrace, Suite 100, Bengaluru")
                    .taxRate(new BigDecimal("5.00"))
                    .taxName("GST 5%")
                    .taxInclusive(false)
                    .reviewSlug("bizflow-retail-express")
                    .inventoryEnabled(true)
                    .active(true)
                    .build();
            return businessRepository.save(biz);
        });

        User owner = userRepository.findByEmailIgnoreCase(ownerEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(demoBusiness)
                    .email(ownerEmail)
                    .fullName("John Owner")
                    .passwordHash(passwordEncoder.encode("Owner@123456"))
                    .phone("+91-98765-00001")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        owner.setPasswordHash(passwordEncoder.encode("Owner@123456"));
        owner.setEnabled(true);
        owner.setActive(true);
        userRepository.save(owner);

        User staff = userRepository.findByEmailIgnoreCase(staffEmail).orElseGet(() -> {
            User u = User.builder()
                    .business(demoBusiness)
                    .email(staffEmail)
                    .fullName("Sarah Staff")
                    .passwordHash(passwordEncoder.encode("Staff@123456"))
                    .phone("+91-98765-00002")
                    .role(Role.STAFF)
                    .enabled(true)
                    .active(true)
                    .build();
            return userRepository.save(u);
        });
        staff.setPasswordHash(passwordEncoder.encode("Staff@123456"));
        staff.setEnabled(true);
        staff.setActive(true);
        userRepository.save(staff);

        // Seed Categories for Legacy Demo
        Category catGroceries = getOrCreateCategory(demoBusiness, "Groceries & Essentials", "Organic staples, whole grains, and culinary essentials");
        Category catSnacks = getOrCreateCategory(demoBusiness, "Beverages & Snacks", "Premium roasted nuts, craft beverages, and snacks");
        Category catPersonal = getOrCreateCategory(demoBusiness, "Personal Care", "Natural soaps, skin care, and personal wellness");

        // Seed Products for Legacy Demo
        Product dp1 = getOrCreateProduct(demoBusiness, catSnacks, "Organic Green Tea (25 Bags)", "Antioxidant rich whole leaf organic green tea bags.", 250.00, 140.00, "BEV-GRN-01", 50, 10);
        Product dp2 = getOrCreateProduct(demoBusiness, catGroceries, "Whole Wheat Sourdough Bread", "Freshly baked artisan sourdough loaf without preservatives.", 90.00, 45.00, "BAK-WHT-02", 30, 5);
        Product dp3 = getOrCreateProduct(demoBusiness, catGroceries, "Cold Pressed Virgin Olive Oil 500ml", "First cold pressed extra virgin Mediterranean olive oil.", 599.00, 350.00, "OIL-OLV-03", 25, 5);
        Product dp4 = getOrCreateProduct(demoBusiness, catSnacks, "Artisan Dark Chocolate Bar 85%", "Single-origin craft dark chocolate with organic cocoa.", 180.00, 95.00, "CHOC-DRK-04", 40, 8);
        Product dp5 = getOrCreateProduct(demoBusiness, catSnacks, "Roasted Salted Almonds 200g", "Crunchy California almonds lightly roasted with Himalayan pink salt.", 280.00, 160.00, "NUT-ALM-05", 35, 5);
        Product dp6 = getOrCreateProduct(demoBusiness, catPersonal, "Organic Wildflower Honey 250g", "Raw unfiltered multifloral forest honey.", 220.00, 120.00, "HON-WLD-06", 45, 8);

        // Seed Customers
        Customer dc1 = getOrCreateCustomer(demoBusiness, "Alice Smith", "+91-98765-11111", "alice@example.com", "123 Maple Street", "Regular buyer");

        // Seed Sample Orders
        if (orderRepository.findRecentOrders(demoBusiness.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(demoBusiness, dc1, "INV-DEMO-001", "John Owner", owner.getId(), PaymentMethod.UPI,
                    List.of(new ItemSpec(dp1, 2, 250.00), new ItemSpec(dp4, 1, 180.00)));
            createSampleOrder(demoBusiness, dc1, "INV-DEMO-002", "Sarah Staff", staff.getId(), PaymentMethod.CASH,
                    List.of(new ItemSpec(dp3, 1, 599.00), new ItemSpec(dp5, 1, 280.00)));
        }

        // Seed Expenses
        if (expenseRepository.countByBusinessId(demoBusiness.getId()) == 0) {
            createExpense(demoBusiness, ExpenseCategory.RENT, "Monthly Retail Store Rent", new BigDecimal("25000.00"), PaymentMethod.NET_BANKING, LocalDate.now().minusDays(10), owner);
        }

        // Seed Reviews
        if (reviewRepository.findRecentReviews(demoBusiness.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createReview(demoBusiness, 5, "Great products and friendly service!", "Alice Smith", "alice@example.com", true);
        }

        log.info("Legacy Demo Business credentials (owner@example.com) ready.");
    }

    private Category getOrCreateCategory(Business business, String name, String description) {
        return categoryRepository.findByBusinessId(business.getId()).stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Category cat = Category.builder()
                            .business(business)
                            .name(name)
                            .description(description)
                            .active(true)
                            .build();
                    return categoryRepository.save(cat);
                });
    }

    private Product getOrCreateProduct(Business business, Category category, String name, String description,
                                       double price, double costPrice, String sku, int stock, int lowThreshold) {
        return productRepository.findByBusinessId(business.getId()).stream()
                .filter(p -> (p.getSku() != null && p.getSku().equalsIgnoreCase(sku)) || p.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Product p = Product.builder()
                            .business(business)
                            .category(category)
                            .name(name)
                            .description(description)
                            .productType(ProductType.PHYSICAL)
                            .price(BigDecimal.valueOf(price))
                            .costPrice(BigDecimal.valueOf(costPrice))
                            .sku(sku)
                            .trackStock(true)
                            .stockQuantity(stock)
                            .lowStockThreshold(lowThreshold)
                            .active(true)
                            .build();
                    return productRepository.save(p);
                });
    }

    private Customer getOrCreateCustomer(Business business, String name, String phone, String email, String address, String notes) {
        return customerRepository.findByBusinessIdOrderByNameAsc(business.getId()).stream()
                .filter(c -> (c.getEmail() != null && c.getEmail().equalsIgnoreCase(email)) || (c.getPhone() != null && c.getPhone().equals(phone)))
                .findFirst()
                .orElseGet(() -> {
                    Customer c = Customer.builder()
                            .business(business)
                            .name(name)
                            .phone(phone)
                            .email(email)
                            .address(address)
                            .notes(notes)
                            .build();
                    return customerRepository.save(c);
                });
    }

    private Location getOrCreateLocation(Business business, String name, String code, String address, String phone, boolean primary) {
        return locationRepository.findByBusinessIdOrderByIdAsc(business.getId()).stream()
                .filter(l -> l.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Location loc = Location.builder()
                            .business(business)
                            .name(name)
                            .code(code)
                            .address(address)
                            .phone(phone)
                            .primary(primary)
                            .active(true)
                            .build();
                    return locationRepository.save(loc);
                });
    }

    private record ItemSpec(Product product, int quantity, double unitPrice) {}

    private void createSampleOrder(Business business, Customer customer, String invoiceNumber,
                                   String createdBy, Long createdByUserId, PaymentMethod paymentMethod,
                                   List<ItemSpec> items) {
        if (orderRepository.existsByBusinessIdAndInvoiceNumber(business.getId(), invoiceNumber)) {
            return;
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .business(business)
                .customer(customer)
                .invoiceNumber(invoiceNumber)
                .orderStatus(OrderStatus.COMPLETED)
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentMethod(paymentMethod)
                .createdBy(createdBy)
                .createdByUserId(createdByUserId)
                .notes("Completed POS order")
                .items(orderItems)
                .build();

        for (ItemSpec spec : items) {
            BigDecimal qty = BigDecimal.valueOf(spec.quantity);
            BigDecimal price = BigDecimal.valueOf(spec.unitPrice);
            BigDecimal itemTotal = price.multiply(qty);
            subtotal = subtotal.add(itemTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(spec.product)
                    .productNameSnapshot(spec.product.getName())
                    .productType(spec.product.getProductType())
                    .quantity(qty)
                    .unitPrice(price)
                    .total(itemTotal)
                    .build();
            orderItems.add(item);
        }

        BigDecimal taxRate = business.getTaxRate() != null ? business.getTaxRate() : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setTotal(total);

        Order savedOrder = orderRepository.save(order);

        Payment payment = Payment.builder()
                .business(business)
                .orderId(savedOrder.getId())
                .amount(total)
                .paymentMethod(paymentMethod)
                .paymentStatus(PaymentStatus.COMPLETED)
                .transactionReference("TXN-" + (System.currentTimeMillis() % 1000000))
                .notes("Verified payment")
                .build();
        paymentRepository.save(payment);
    }

    private void createExpense(Business business, ExpenseCategory category, String description,
                               BigDecimal amount, PaymentMethod paymentMethod, LocalDate date, User user) {
        Expense expense = Expense.builder()
                .business(business)
                .category(category)
                .description(description)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .expenseDate(date)
                .createdBy(user)
                .build();
        expenseRepository.save(expense);
    }

    private void createReview(Business business, int rating, String feedback, String name, String contact, boolean positive) {
        Review review = Review.builder()
                .business(business)
                .rating(rating)
                .feedbackText(feedback)
                .customerName(name)
                .customerContact(contact)
                .positive(positive)
                .redirectedToPublicPlatform(positive)
                .hidden(false)
                .build();
        reviewRepository.save(review);
    }

    private void seedAdmin(String email, String rawPassword, String fullName) {
        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(passwordEncoder.encode(rawPassword));
                    admin.setEnabled(true);
                    admin.setActive(true);
                    userRepository.save(admin);
                },
                () -> {
                    log.info("Seeding platform admin user: {}", email);
                    User admin = User.builder()
                            .business(null)
                            .email(email)
                            .fullName(fullName)
                            .passwordHash(passwordEncoder.encode(rawPassword))
                            .phone("+91-800-555-0199")
                            .role(Role.ADMIN)
                            .enabled(true)
                            .active(true)
                            .build();

                    userRepository.save(admin);
                    log.info("Platform admin [{}] successfully seeded.", email);
                }
        );
    }
}
