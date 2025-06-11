package ru.kata.spring.boot_security.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.kata.spring.boot_security.demo.entitys.User;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

      @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
      List<User> findAllWithRoles();

      @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
      Optional<User> findByIdWithRoles(@Param("id") Long id);

      @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.username = :username")
      Optional<User> findByUsernameWithRoles(@Param("username") String username);

      Optional<User> findByUsername(String username);
}
