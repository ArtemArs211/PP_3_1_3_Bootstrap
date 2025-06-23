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

import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        Map<String, Role> roles = roleRepository.findAll().stream()
                .collect(Collectors.toMap(Role::getRoleName, Function.identity()));

        Role roleUser = roles.computeIfAbsent("ROLE_USER", name -> {
            Role role = new Role(name);
            return roleRepository.save(role);
        });

        Role roleAdmin = roles.computeIfAbsent("ROLE_ADMIN", name -> {
            Role role = new Role(name);
            return roleRepository.save(role);
        });

        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User("User", "User", "user@example.com",
                    passwordEncoder.encode("user"), "user", 30);
            user.setRoles(Set.of(roleUser));
            userRepository.save(user);
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User("Admin", "Admin", "admin@example.com",
                    passwordEncoder.encode("admin"), "admin", 35);
            admin.setRoles(Set.of(roleAdmin, roleUser));
            userRepository.save(admin);
        }
    }
}