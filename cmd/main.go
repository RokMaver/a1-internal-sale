package main

import (
	"encoding/csv"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

func getBaseDir() string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Dir(filename)
}

func main() {
	baseDir := getBaseDir()

	// Serve static files from the "static" directory
	staticDir := filepath.Join(baseDir, "../static")
	fs := http.FileServer(http.Dir(staticDir))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Handler for the index page
	h1 := func(w http.ResponseWriter, r *http.Request) {
		tmplPath1 := filepath.Join(baseDir, "../internal/html/index.html")
		tmplPath2 := filepath.Join(baseDir, "../internal/html/header.html")
		tmp1 := template.Must(template.ParseFiles(tmplPath1, tmplPath2))

		// Read the deadline from the file
		deadlinePath := filepath.Join(baseDir, "../data/deadline.txt")
		deadline, err := os.ReadFile(deadlinePath)
		if err != nil {
			http.Error(w, "Could not read deadline", http.StatusInternalServerError)
			return
		}

		// Pass the deadline to the template
		data := map[string]string{
			"Deadline": string(deadline),
		}
		tmp1.Execute(w, data)
	}

	// Handler for the items page
	internaItems := func(w http.ResponseWriter, r *http.Request) {
		// Read the deadline from the file
		deadlinePath := filepath.Join(baseDir, "../data/deadline.txt")
		deadline, err := os.ReadFile(deadlinePath)
		if err != nil {
			http.Error(w, "Could not read deadline", http.StatusInternalServerError)
			return
		}

		// Parse the deadline with RFC3339 layout
		deadlineTime, err := time.Parse(time.RFC3339, string(deadline))
		if err != nil {
			log.Printf("Deadline string: %s", string(deadline))
			http.Error(w, "Invalid deadline format", http.StatusInternalServerError)
			return
		}

		// Check if the deadline has passed
		if time.Now().After(deadlineTime) {
			http.Error(w, "The items page is locked as the deadline has passed", http.StatusForbidden)
			return
		}

		filePath := filepath.Join(baseDir, "../data/uploaded.csv")
		file, err := os.Open(filePath)
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

		tmplPath1 := filepath.Join(baseDir, "../internal/html/items.html")
		tmplPath2 := filepath.Join(baseDir, "../internal/html/header.html")
		tmp2 := template.Must(template.ParseFiles(tmplPath1, tmplPath2))
		tmp2.Execute(w, groupedRecords)
	}

	adminCtrl := func(w http.ResponseWriter, r *http.Request) {
		tmplPath1 := filepath.Join(baseDir, "../internal/html/admin.html")
		tmplPath2 := filepath.Join(baseDir, "../internal/html/header.html")
		tmp3 := template.Must(template.ParseFiles(tmplPath1, tmplPath2))
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

		dstPath := filepath.Join(baseDir, "../data/uploaded.csv")
		dst, err := os.Create(dstPath)
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
		deadlinePath := filepath.Join(baseDir, "../data/deadline.txt")
		err = os.WriteFile(deadlinePath, []byte(deadline), 0644)
		if err != nil {
			http.Error(w, "Could not save deadline", http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, "/index", http.StatusSeeOther)
	}

	myItems := func(w http.ResponseWriter, r *http.Request) {
		tmplPath1 := filepath.Join(baseDir, "../internal/html/myItems.html")
		tmplPath2 := filepath.Join(baseDir, "../internal/html/header.html")
		tmp4 := template.Must(template.ParseFiles(tmplPath1, tmplPath2))

		// Read the deadline from the file
		deadlinePath := filepath.Join(baseDir, "../data/deadline.txt")
		deadline, err := os.ReadFile(deadlinePath)
		if err != nil {
			http.Error(w, "Could not read deadline", http.StatusInternalServerError)
			return
		}

		// Pass the deadline to the template
		data := map[string]string{
			"Deadline": string(deadline),
		}
		tmp4.Execute(w, data)
	}

	http.HandleFunc("/", h1)
	http.HandleFunc("/items", internaItems)
	http.HandleFunc("/admin", adminCtrl)
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/myitems", myItems)
	log.Fatal(http.ListenAndServe(":8000", nil))
}
