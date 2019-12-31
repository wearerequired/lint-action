package main

import "fmt"

var str = "world"

func main() {
	fmt.Println("hello " + doSomething(str))
}

func doSomething(str string) string {
	if str == "" {
		return "default"
	} else {
		// Error for unnecessary "else" statement
		return str
	}
}
