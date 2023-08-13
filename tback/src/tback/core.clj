(ns tback.core
  (:require [ring.adapter.jetty :as jetty]
            [ring.logger :as logger]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.json :as mw-json]
            [ring.middleware.params :as params]
            [ring.middleware.defaults :as r]
            [clojure.data.json :as json])
  (:gen-class))

(def empty-board [[nil nil nil]
                  [nil nil nil]
                  [nil nil nil]])
(def board (atom empty-board))

(defn board-reset [{:keys [headers]}]
  (swap! board (fn [_] empty-board))
  (clojure.pprint/pprint @board)
  {:status 200
   :headers { "Content-Type" "application/json"
             "Access-Control-Allow-Origin" (get headers "origin" "*")}
   :body (json/write-str {:status "Game restarted"
                          :board @board})})

(defn post-move [{:keys [params headers]}]
  ;;  (println "POST request:")
  ;;  (clojure.pprint/pprint req)
  (let [{:keys [row col player]} params
        resp-headers {"Content-Type" "application/json"
                      "Access-Control-Allow-Origin" (get headers "origin" "*")
                      "Access-Control-Allow-Headers" "Content-Type"}]
    (if (and (string? row) (string? col))
      (let [row (Integer/parseInt row)
            col (Integer/parseInt col)]
        (println (format "Params: %d, %d" row col))
        (if-not (nth (nth @board row) col)
          (do
            (swap! board
                   #(map-indexed (fn [i row-old]
                                   (if (= i row)
                                     (vec
                                      (map-indexed
                                       (fn [j col-old]
                                         (if (= j col)
                                           player
                                           col-old))
                                       row-old))
                                     row-old)) %))
            (clojure.pprint/pprint @board)            
            {:status 200
             :headers resp-headers
             :body (json/write-str {:status (format "Move recorded: [%d, %d]" row col)
                                    :board @board})})
          {:status 400
           :headers resp-headers
           :body (json/write-str {:status "Bad request: field already taken"})}))
      {:status 400
       :headers resp-headers
       :body (json/write-str {:status "Bad request: row and col should be sent"})})))

(defn options [{:keys [headers]}]
  ;;(clojure.pprint/pprint req)
  {:status 200
   :headers {"Content-Type" "text/plain"
             "Access-Control-Allow-Methods" "POST, OPTIONS, GET, DELETE"
             "Access-Control-Allow-Origin" (get headers "origin" "*")
             "Access-Control-Allow-Headers" "Content-Type"}
   :body (json/write-str {:status "OK, go ahead"})})

(defn board-state [{:keys [headers]}]
  (clojure.pprint/pprint @board)
  {:status 200
   :headers { "Content-Type" "application/json"
             "Access-Control-Allow-Origin" (get headers "origin" "*")}
   :body (json/write-str {:board @board})})

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (defroutes app
    (GET "/board" req (board-state req))
    (DELETE "/board" req (board-reset req))
    (POST "/move" req (post-move req))
    (OPTIONS "/move" req (options req))
    (OPTIONS "/board" req (options req))
    (route/not-found "<h1>Page not found</h1>"))
  (jetty/run-jetty
   (-> app
       logger/wrap-with-logger
       mw-json/wrap-json-body
       (r/wrap-defaults (assoc-in r/site-defaults [:security :anti-forgery] false)))
   {:port 8080}))
