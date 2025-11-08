package tree_sitter_arktype_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_arktype "github.com/tree-sitter/tree-sitter-arktype/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_arktype.Language())
	if language == nil {
		t.Errorf("Error loading ArkType grammar")
	}
}
