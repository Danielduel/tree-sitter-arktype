import XCTest
import SwiftTreeSitter
import TreeSitterArktype

final class TreeSitterArktypeTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_arktype())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading ArkType grammar")
    }
}
