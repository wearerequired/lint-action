package main

import (
	"fmt"
	"log"
	"regexp"
)

func ValidateEmails(addrs []string) (bool, error) {
	for _, email := range addrs {
		//lint:ignore SA1000 we love invalid regular expressions!
		matched, err := regexp.MatchString("^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\\.[a-zA-Z0-9]*$", email)
		if err != nil {
			return false, err
		}

		if !matched {
			return false, nil
		}
	}

	return true, nil
}

func main2() {
	emails := []string{"testuser@gmail.com", "anotheruser@yahoo.com", "onemoreuser@hotmail.com"}

	matched, err := ValidateEmails(emails)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(matched)
}