export type ChineseCharacter = {
  character: string;
  translation: string | null;
  example: string | null;
  addedAt: Date | null;
  type: "verb" | "noun" | "adjective" | "adverb" | "link" | null;
  importance: "high" | "medium" | "low" | null;
  lastSeenAt: Date | null;
  numberOfCorrectAnswers: number | null;
  levelOfConfidence: "high" | "low" | null;
};

export type ChineseCharacterFilter =
  | {
      property: string;
      date: any; // see: https://developers.notion.com/reference/post-database-query-filter#date
    }
  | {
      property: string;
      select:
        | {
            equals: string;
          }
        | {
            does_not_equal: string;
          }
        | {
            is_empty: true;
          }
        | {
            is_not_empty: true;
          }; // see: https://developers.notion.com/reference/post-database-query-filter#select
    }
  | {
      property: string;
      multi_select:
        | {
            contains: string;
          }
        | {
            does_not_contain: string;
          }
        | {
            is_empty: true;
          }
        | {
            is_not_empty: true;
          }; // see: https://developers.notion.com/reference/post-database-query-filter#multi_select
    }
  | {
      property: string;
      select:
        | {
            equals: string;
          }
        | {
            does_not_equal: string;
          }
        | {
            is_empty: true;
          }
        | {
            is_not_empty: true;
          }; // see: https://developers.notion.com/reference/post-database-query-filter#select
    };
