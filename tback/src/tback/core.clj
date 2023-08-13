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
(def prev-player (atom nil))

(defn def-headers [headers]
  {"Access-Control-Allow-Methods" "POST, OPTIONS, GET, DELETE"
   "Access-Control-Allow-Origin" (get headers "origin" "*")
   "Access-Control-Allow-Headers" "Content-Type"})

(defn board-reset [{:keys [headers]}]
  (swap! board (fn [_] empty-board))
  (clojure.pprint/pprint @board)
  {:status 200
   :headers (def-headers headers)
   :body {:status "Game restarted"
          :board @board}})

(defn game-winner [board]
  (let [check-vert (fn [i]
                     (let [item (nth (nth board 0) i)]
                       (when (every? #(= item (nth (nth board %) i)) [1 2])
                         item)))
        check-hor (fn [i]
                    (let [item (nth (nth board i) 0)]
                      (when (every? #(= item (nth (nth board i) %)) [1 2])
                        item)))
        check-diag (fn [i]
                     (let [diag (mod i 2) ;; [0 1 2] => [0 1]
                           cols (if (pos? diag) [0 1 2] [2 1 0])
                           item (nth (nth board 0) (first cols))]
                       (when (every? #(= item (nth (nth board %) (nth cols %))) [1 2])
                         item)))]
    (->> (mapv (fn [checker]
                 (mapv #(checker %) [0 1 2]))
               [check-vert check-hor check-diag])
         flatten
         (filter #(not (nil? %)))
         first)))

(defn post-move [{:keys [params headers]}]
  ;;  (println "POST request:")
  ;;  (clojure.pprint/pprint req)
  (let [{:keys [row col player]} params
        bad-request (fn [reason]
                      {:status 400
                       :headers (def-headers headers)
                       :body {:status (str "Bad request: " reason)}})]
    (cond
      (not (and (string? row)
                (string? col)
                (string? player))) (bad-request "row, col and player should be sent")
      
      (= @prev-player player) (bad-request "not your turn!")
      
      (game-winner @board) (bad-request "game over")
      
      :else (let [row (Integer/parseInt row)
                  col (Integer/parseInt col)]
              (println (format "Params: %d, %d, %s" row col player))
              (if (nth (nth @board row) col)
                (bad-request "field busy")
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
                  (let [base-resp {:status (format "Move recorded: [%d, %d]" row col)
                                   :board @board}
                        resp (if-let [winner (game-winner @board)]
                               (assoc base-resp :winner winner)
                               base-resp)]
                    (swap! prev-player (constantly player))
                    {:status 200
                     :headers (def-headers headers)
                     :body resp})))))))

(defn options [{:keys [headers]}]
  ;;(clojure.pprint/pprint req)
  {:status 200
   :headers (def-headers headers)
   :body {:status "OK, go ahead"}})

(defn board-state [{:keys [headers]}]
  (clojure.pprint/pprint @board)
  {:status 200
   :headers (def-headers headers)
   :body {:board @board}})

(defn -main
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
       mw-json/wrap-json-response
       (r/wrap-defaults (assoc-in r/site-defaults [:security :anti-forgery] false)))
   {:port 8080}))
