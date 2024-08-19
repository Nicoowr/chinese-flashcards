type PartialSelectResponse<PossibleValue extends string> = {
  id: string;
  name: PossibleValue;
};

type DatabasePropertyConfigResponse = any;

// TITLE
type TitleDatabasePropertyConfigResponse = {
  type: "title";
  title: { plain_text: string }[];
  id: string;
  name: string;
};

const notionPropertyIsTitleDatabaseProperty = (
  property: DatabasePropertyConfigResponse
): property is TitleDatabasePropertyConfigResponse => {
  return property.type === "title";
};

export const extractNotionTitle = (
  property: DatabasePropertyConfigResponse
) => {
  if (notionPropertyIsTitleDatabaseProperty(property)) {
    return property.title[0].plain_text;
  }
  throw new Error("Property is not a title: " + JSON.stringify(property));
};

// RICH TEXT
type RichTextDatabasePropertyConfigResponse = {
  type: "rich_text";
  rich_text: { plain_text: string }[];
  id: string;
  name: string;
};

const notionPropertyIsRichTextDatabaseProperty = (
  property: DatabasePropertyConfigResponse
): property is RichTextDatabasePropertyConfigResponse => {
  return property.type === "rich_text";
};

export const extractNotionRichText = (
  property: DatabasePropertyConfigResponse
): string | null => {
  if (notionPropertyIsRichTextDatabaseProperty(property)) {
    return property.rich_text[0]?.plain_text ?? null;
  }
  throw new Error("Property is not a rich text: " + JSON.stringify(property));
};

// DATE
type DateDatabasePropertyConfigResponse = {
  type: "date";
  date: { start: string } | null;
  id: string;
  name: string;
};

const notionPropertyIsDateDatabaseProperty = (
  property: DatabasePropertyConfigResponse
): property is DateDatabasePropertyConfigResponse => {
  return property.type === "date";
};

export const extractNotionDate = (property: DatabasePropertyConfigResponse) => {
  if (notionPropertyIsDateDatabaseProperty(property)) {
    return property.date ? new Date(property.date.start) : null;
  }
  throw new Error("Property is not a date: " + JSON.stringify(property));
};

// SELECT
type SelectPropertyItemObjectResponse<PossibleValue extends string> = {
  type: "select";
  select: PartialSelectResponse<PossibleValue> | null;
  object: "property_item";
  id: string;
};

const notionPropertyIsSelectPropertyItemObject = <PossibleValue extends string>(
  property: DatabasePropertyConfigResponse
): property is SelectPropertyItemObjectResponse<PossibleValue> => {
  return property.type === "select";
};

export const extractSelectValue = <PossibleValue extends string>(
  property: DatabasePropertyConfigResponse
) => {
  if (notionPropertyIsSelectPropertyItemObject<PossibleValue>(property)) {
    return property.select?.name ?? null;
  }
  throw new Error("Property is not a select: " + JSON.stringify(property));
};

// MULTI SELECT
type MultiSelectPropertyItemObjectResponse<PossibleValue extends string> = {
  type: "multi_select";
  multi_select: PartialSelectResponse<PossibleValue>[];
  object: "property_item";
  id: string;
};

const notionPropertyIsMultiSelectPropertyItemObject = <
  PossibleValue extends string,
>(
  property: DatabasePropertyConfigResponse
): property is MultiSelectPropertyItemObjectResponse<PossibleValue> => {
  return property.type === "multi_select";
};

export const extractMultiSelectFirstValue = <PossibleValue extends string>(
  property: DatabasePropertyConfigResponse
): PossibleValue | null => {
  if (notionPropertyIsMultiSelectPropertyItemObject<PossibleValue>(property)) {
    return property.multi_select[0]?.name ?? null;
  }
  throw new Error(
    "Property is not a multi select: " + JSON.stringify(property)
  );
};

// STATUS
type StatusPropertyItemObjectResponse<PossibleValue extends string> = {
  type: "status";
  status: PartialSelectResponse<PossibleValue> | null;
  object: "property_item";
  id: string;
};

const notionPropertyIsStatusPropertyItemObject = <PossibleValue extends string>(
  property: DatabasePropertyConfigResponse
): property is StatusPropertyItemObjectResponse<PossibleValue> => {
  return property.type === "status";
};

export const extractStatusValue = <PossibleValue extends string>(
  property: DatabasePropertyConfigResponse
) => {
  if (notionPropertyIsStatusPropertyItemObject<PossibleValue>(property)) {
    return property.status?.name;
  }
  throw new Error("Property is not a status: " + JSON.stringify(property));
};

// NUMBER
type NumberDatabasePropertyConfigResponse = {
  type: "number";
  number: number | null;
  id: string;
};

const notionPropertyIsNumberDatabaseProperty = (
  property: DatabasePropertyConfigResponse
): property is NumberDatabasePropertyConfigResponse => {
  return property.type === "number";
};

export const extractNumber = (property: DatabasePropertyConfigResponse) => {
  if (notionPropertyIsNumberDatabaseProperty(property)) {
    return property.number;
  }
  throw new Error("Property is not a number: " + JSON.stringify(property));
};
