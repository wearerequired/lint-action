package main

import (
	"errors"
	"fmt"
	"log"
)

type Result struct {
	Entries []string
}

func Query() (Result, error) {
	return Result{
		Entries: []string{},
	}, nil
}

func ResultEntries() (Result, error) {
	err := errors.New("no entries found")
	result, err := Query()
	if err != nil {
		return Result{}, err
	}
	if len(result.Entries) == 0 {
		return Result{}, err
	}
	return result, nil
}

func main1() {
	result, err := ResultEntries()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("result=%v, err=%v", result, err)
}
