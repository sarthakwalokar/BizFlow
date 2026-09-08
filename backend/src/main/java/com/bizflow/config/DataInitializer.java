package com.bizflow.config;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.BusinessSize;
import com.bizflow.business.BusinessType;
import com.bizflow.user.Role;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initSeedData() {
        return args -> {
            // 1. Seed Platform Admins
            seedAdmin("admin@bizflow.com", "Admin@123456", "BizFlow Root Administrator");
            seedAdmin("admin@bizflow.io", "Admin@BizFlow2026!", "Platform Super Admin");

            // 2. Ensure Small Business Demo Accounts Exist
            seedSmallBusiness();

            // 3. Ensure Large Business Demo Accounts Exist
            seedLargeBusiness();

            // 4. Fallback Demo Business (owner@example.com)
            seedLegacyDemoBusiness();
        };
    }

    private void seedSmallBusiness() {
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
        userRepository.findByEmail(ownerEmail).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("Owner@12345"));
                    user.setEnabled(true);
                    user.setActive(true);
                    userRepository.save(user);
                },
                () -> {
                    User owner = User.builder()
                            .business(smallBiz)
                            .email(ownerEmail)
                            .fullName("Arjun Kapoor")
                            .passwordHash(passwordEncoder.encode("Owner@12345"))
                            .phone("+91-98765-43210")
                            .role(Role.OWNER)
                            .enabled(true)
                            .active(true)
                            .build();
                    userRepository.save(owner);
                }
        );

        // Ensure small business staff
        userRepository.findByEmail(staffEmail).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("Staff@12345"));
                    user.setEnabled(true);
                    user.setActive(true);
                    userRepository.save(user);
                },
                () -> {
                    User staff = User.builder()
                            .business(smallBiz)
                            .email(staffEmail)
                            .fullName("Pooja Nair")
                            .passwordHash(passwordEncoder.encode("Staff@12345"))
                            .phone("+91-98765-43211")
                            .role(Role.STAFF)
                            .enabled(true)
                            .active(true)
                            .build();
                    userRepository.save(staff);
                }
        );

        log.info("Small Business demo credentials (Chai & Bites Café) ready: {} & {}", ownerEmail, staffEmail);
    }

    private void seedLargeBusiness() {
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
        userRepository.findByEmail(ownerEmail).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("Owner@12345"));
                    user.setEnabled(true);
                    user.setActive(true);
                    userRepository.save(user);
                },
                () -> {
                    User owner = User.builder()
                            .business(largeBiz)
                            .email(ownerEmail)
                            .fullName("Rajesh Singhania")
                            .passwordHash(passwordEncoder.encode("Owner@12345"))
                            .phone("+91-98800-11223")
                            .role(Role.OWNER)
                            .enabled(true)
                            .active(true)
                            .build();
                    userRepository.save(owner);
                }
        );

        // Ensure large business manager
        userRepository.findByEmail(managerEmail).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("Staff@12345"));
                    user.setEnabled(true);
                    user.setActive(true);
                    userRepository.save(user);
                },
                () -> {
                    User mgr = User.builder()
                            .business(largeBiz)
                            .email(managerEmail)
                            .fullName("Kavita Joshi")
                            .passwordHash(passwordEncoder.encode("Staff@12345"))
                            .phone("+91-98800-22334")
                            .role(Role.STAFF)
                            .enabled(true)
                            .active(true)
                            .build();
                    userRepository.save(mgr);
                }
        );

        // Ensure large business cashier
        userRepository.findByEmail(cashierEmail).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("Staff@12345"));
                    user.setEnabled(true);
                    user.setActive(true);
                    userRepository.save(user);
                },
                () -> {
                    User cashier = User.builder()
                            .business(largeBiz)
                            .email(cashierEmail)
                            .fullName("Manoj Kumar")
                            .passwordHash(passwordEncoder.encode("Staff@12345"))
                            .phone("+91-98800-33445")
                            .role(Role.STAFF)
                            .enabled(true)
                            .active(true)
                            .build();
                    userRepository.save(cashier);
                }
        );

        log.info("Large Business demo credentials (Apex Electronics) ready: {}, {}, {}", ownerEmail, managerEmail, cashierEmail);
    }

    private void seedLegacyDemoBusiness() {
        String ownerEmail = "owner@example.com";
        if (!userRepository.existsByEmail(ownerEmail)) {
            Business demoBusiness = businessRepository.findByName("BizFlow Retail Express").orElseGet(() -> {
                Business biz = Business.builder()
                        .name("BizFlow Retail Express")
                        .businessType(BusinessType.RETAIL)
                        .businessSize(BusinessSize.SMALL)
                        .currency("INR")
                        .timezone("Asia/Kolkata")
                        .email("contact@bizflowretail.com")
                        .phone("+91-98765-00000")
                        .address("742 Evergreen Terrace, Suite 100")
                        .taxRate(new BigDecimal("5.00"))
                        .taxName("GST 5%")
                        .taxInclusive(false)
                        .reviewSlug("bizflow-retail-express")
                        .inventoryEnabled(true)
                        .active(true)
                        .build();
                return businessRepository.save(biz);
            });

            User owner = User.builder()
                    .business(demoBusiness)
                    .email(ownerEmail)
                    .fullName("John Owner")
                    .passwordHash(passwordEncoder.encode("Owner@123456"))
                    .phone("+91-98765-00001")
                    .role(Role.OWNER)
                    .enabled(true)
                    .active(true)
                    .build();
            userRepository.save(owner);

            String staffEmail = "staff@example.com";
            if (!userRepository.existsByEmail(staffEmail)) {
                User staff = User.builder()
                        .business(demoBusiness)
                        .email(staffEmail)
                        .fullName("Sarah Staff")
                        .passwordHash(passwordEncoder.encode("Staff@123456"))
                        .phone("+91-98765-00002")
                        .role(Role.STAFF)
                        .enabled(true)
                        .active(true)
                        .build();
                userRepository.save(staff);
            }
        }
    }

    private void seedAdmin(String email, String rawPassword, String fullName) {
        userRepository.findByEmail(email).ifPresentOrElse(
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
