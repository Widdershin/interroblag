class Post < ActiveRecord::Base
  has_many :links, foreign_key: :post_id, :class_name => "Link"
  has_many :linked_posts, through: :links
end
