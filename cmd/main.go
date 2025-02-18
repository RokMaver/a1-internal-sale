package main

import (
	"encoding/csv"
	"html/template"
	"log"
	"net/http"
	"os"
)

func main() {
	// Serve static files from the "static" directory
	fs := http.FileServer(http.Dir("../static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Handler for the index page
	h1 := func(w http.ResponseWriter, r *http.Request) {
		tmp1 := template.Must(template.ParseFiles("../internal/html/index.html", "../internal/html/header.html"))
		tmp1.Execute(w, nil)
	}

	// Handler for the items page
	internaItems := func(w http.ResponseWriter, r *http.Request) {
		file, err := os.Open("../data/interna1.csv")
		if err != nil {
			http.Error(w, "Could not open CSV file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		reader := csv.NewReader(file)
		reader.Comma = ';'
		records, err := reader.ReadAll()
		if err != nil {
			http.Error(w, "Could not read CSV file", http.StatusInternalServerError)
			return
		}

		groupedRecords := make(map[string][][]string)
		for _, record := range records {
			key := record[0]
			groupedRecords[key] = append(groupedRecords[key], record)
		}

		tmp2 := template.Must(template.ParseFiles("../internal/html/items.html", "../internal/html/header.html"))
		tmp2.Execute(w, groupedRecords)
	}

	http.HandleFunc("/", h1)
	http.HandleFunc("/items", internaItems)
	log.Fatal(http.ListenAndServe(":8000", nil))
}
