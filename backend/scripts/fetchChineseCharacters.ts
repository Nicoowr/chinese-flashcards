import { fetchChineseCharacters } from "../src/dependencies/notion";

/* Example:
{
    "Example": {
      "id": "%3EWI%7C",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "历史",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "历史",
          "href": null
        },
        {
          "type": "text",
          "text": {
            "content": "悠久",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "purple"
          },
          "plain_text": "悠久",
          "href": null
        }
      ]
    },
    "Added At": {
      "id": "FwNo",
      "type": "date",
      "date": {
        "start": "2024-07-21",
        "end": null,
        "time_zone": null
      }
    },
    "Translation": {
      "id": "XopM",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Long-standing",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Long-standing",
          "href": null
        }
      ]
    },
    "Type": {
      "id": "Zddm",
      "type": "multi_select",
      "multi_select": [
        {
          "id": "hWoX",
          "name": "Adjective",
          "color": "purple"
        }
      ]
    },
    "Importance": {
      "id": "%5E%3EDj",
      "type": "select",
      "select": {
        "id": "dcAv",
        "name": "Medium",
        "color": "yellow"
      }
    },
    "Start/Stop": {
      "id": "hsHU",
      "type": "rich_text",
      "rich_text": []
    },
    "❤️": {
      "id": "l%3AqH",
      "type": "status",
      "status": {
        "id": "50483371-f7e1-4452-9546-d210ad0a75fb",
        "name": "❌",
        "color": "red"
      }
    },
    "Staged": {
      "id": "%7BQ%60D",
      "type": "checkbox",
      "checkbox": false
    },
    "Character": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "悠久",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "悠久",
          "href": null
        }
      ]
    }
  }
 */
const main = async () => {
  const characters = await fetchChineseCharacters([]);
  console.log(characters);
};
main();
