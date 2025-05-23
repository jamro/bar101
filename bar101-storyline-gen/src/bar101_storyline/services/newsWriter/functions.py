get_publish_news = lambda news_segment_count: {
  "name": "publish_news",
  "description": "Write a news segment",
  "parameters": {
      "type": "object",
      "properties": {
          "news_segmenrs": {
              "type": "array",
              "description": f"List of EXACTY {news_segment_count} news segments.",
              "items": {
                  "type": "object",
                  "properties": {
                      "image_id": {
                          "type": "string",
                          "description": "The id of the image to use for the news segment. The image should be a visual representation of the news segment. The id MUST be in the list of NEWS_IMAGES."
                      },
                      "headline": {
                          "type": "string",
                          "description": "The headline of the news segment. This should be a short, punchy statement that captures the essence of the news. 2-3 words long."
                      },
                      "anchor_line": {
                          "type": "string",
                          "description": "The anchor line of the news segment. One sentence stating the event"
                      },
                      "contextual_reframing": {
                          "type": "string",
                          "description": "The contextual reframing of the news segment adjusted to official or underground news. 1-2 sentences long."
                      }
                  },
                  "required": ["headline", "anchor_line", "contextual_reframing"]
              }
          }
      },
      "required": ["news_segmenrs"]
  }
}