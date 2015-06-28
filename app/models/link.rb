class Link < ActiveRecord::Base
  belongs_to :post, foreign_key: :post_id, class_name: "Post"
  belongs_to :linked_post, foreign_key: :linked_post_id, class_name: "Post"
end
