package cache

// ElementKey 用于保存元素
func ElementKey(elementId string) string {
	return "element:" + elementId
}

// ElementKeyString 用于保存元素, id以字符串传入
func ElementKeyString(elementId string) string {
	return "element:" + elementId
}

// PageElementsKey 每个page内全部元素的id
func PageElementsKey(pageId string) string {
	return "page:" + pageId
}
