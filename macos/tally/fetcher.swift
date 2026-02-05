//
//  fetcher.swift
//  tally
//
//  Created by Hadi Hamoud on 1/31/26.
//


struct TallyTask: Decodable {
    let id: String
    let title: String
    let important: Bool
    let urgent: Bool
    let quadrant: String
    let createdAt: String
    
}
