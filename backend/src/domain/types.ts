export type ChineseCharacter = {
  character: string;
  translation: string;
  example: string;
  metadata: {
    addedAt: Date;
    type: "verb" | "noun" | "adjective" | "adverb" | "link";
    importance: "high" | "medium" | "low";
    lastSeenAt: Date;
    numberOfCorrectAnswers: number;
    levelOfConfidence: "✅" | "❌";
  };
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
