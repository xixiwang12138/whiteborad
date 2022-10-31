package cache

import "strconv"

// ElementKey 用于保存元素
func ElementKey(elementId int64) string {
	return "element:" + strconv.FormatInt(elementId, 10)
}

// PageElementsKey 每个page内全部元素的id
func PageElementsKey(pageId int64) string {
	return "page:" + strconv.FormatInt(pageId, 10)
}
