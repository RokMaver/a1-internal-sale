package main

import (
	"encoding/csv"
	"html/template"
	"log"
	"net/http"
	"os"
)

func main() {

	h1 := func(w http.ResponseWriter, r *http.Request) {
		tmp1 := template.Must(template.ParseFiles("html/index.html"))
		tmp1.Execute(w, nil)
	}

	internaItems := func(w http.ResponseWriter, r *http.Request) {

		file, err := os.Open("interna1.csv")
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

		tmp2 := template.Must(template.ParseFiles("html/items.html"))
		tmp2.Execute(w, groupedRecords)
	}

	http.HandleFunc("/", h1)
	http.HandleFunc("/items", internaItems)
	log.Fatal(http.ListenAndServe(":8000", nil))
}
