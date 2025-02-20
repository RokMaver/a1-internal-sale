package main

import (
	"encoding/csv"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
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
		file, err := os.Open("../data/uploaded.csv")
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

	adminCtrl := func(w http.ResponseWriter, r *http.Request) {
		tmp3 := template.Must(template.ParseFiles("../internal/html/admin.html", "../internal/html/header.html"))
		tmp3.Execute(w, nil)
	}

	uploadHandler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		file, _, err := r.FormFile("csvfile")
		if err != nil {
			http.Error(w, "Could not read uploaded file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		dst, err := os.Create(filepath.Join("../data", "uploaded.csv"))
		if err != nil {
			http.Error(w, "Could not save uploaded file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		_, err = dst.ReadFrom(file)
		if err != nil {
			http.Error(w, "Could not save uploaded file", http.StatusInternalServerError)
			return
		}

		deadline := r.FormValue("deadline")
		if deadline == "" {
			http.Error(w, "Deadline is required", http.StatusBadRequest)
			return
		}

		// Save the deadline to a file or database as needed
		err = os.WriteFile(filepath.Join("../data", "uploaded.txt"), []byte(deadline), 0644)
		if err != nil {
			http.Error(w, "Could not save deadline", http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, "/items", http.StatusSeeOther)
	}

	http.HandleFunc("/", h1)
	http.HandleFunc("/items", internaItems)
	http.HandleFunc("/admin", adminCtrl)
	http.HandleFunc("/upload", uploadHandler)
	log.Fatal(http.ListenAndServe(":8000", nil))
}
