package ru.kata.spring.boot_security.demo.service;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.entitys.Role;
import ru.kata.spring.boot_security.demo.entitys.User;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAllWithRoles();
    }

    @Override
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID: " + id));
    }

    @Override
    @Transactional
    public void save(User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByRoleName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Роль ROLE_USER не найдена в БД"));
            user.setRoles(Set.of(userRole));
        }

        userRepository.save(user);
    }

    @Transactional
    @Override
    public void update(Long id, User updatedUser) {
        User existingUser = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + id + " not found"));

        existingUser.setName(updatedUser.getName());
        existingUser.setSurname(updatedUser.getSurname());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setAge(updatedUser.getAge());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()
                && !passwordEncoder.matches(updatedUser.getPassword(), existingUser.getPassword())) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        existingUser.getRoles().clear();
        for (Role role : updatedUser.getRoles()) {
            Role persistedRole = roleRepository.findById(role.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Role not found"));
            existingUser.getRoles().add(persistedRole);
        }

        userRepository.save(existingUser);
    }

    @Transactional
    @Override
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return findByUsername(username);
    }
}