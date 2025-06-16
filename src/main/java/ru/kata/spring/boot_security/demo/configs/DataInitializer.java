package ru.kata.spring.boot_security.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.entitys.Role;
import ru.kata.spring.boot_security.demo.entitys.User;

import javax.transaction.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        Role roleUser = roleRepository.findByRoleName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));
        Role roleAdmin = roleRepository.findByRoleName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User("User", "User", "user@example.com", passwordEncoder.encode("user"), "user", 30);
            user.setRoles(new HashSet<>(Set.of(roleUser)));
            userRepository.save(user);
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User("Admin", "Admin", "admin@example.com", passwordEncoder.encode("admin"), "admin", 35);
            admin.setRoles(new HashSet<>(Set.of(roleAdmin)));
            userRepository.save(admin);
        }
    }
}
