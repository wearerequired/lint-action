package main

import "fmt"

var str = "world"

func main () { // Whitespace error
	fmt.Println("hello " + str)
}

func add(num1 int, num2 int) int {
	return num1 + num2
}

func subtract(num1 int, num2 int) int {
	return num1 - num2
}

func multiply(num1 int, num2 int) int {
  return num1 * num2 // Indentation error
}
